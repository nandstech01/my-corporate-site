"""GSC daily data collector."""

from __future__ import annotations

import json
from datetime import datetime, timedelta

from blog_worker.config import settings
from blog_worker.db import get_supabase


async def collect_gsc_data() -> None:
    """Collect daily GSC metrics for /posts/* URLs.

    Uses Google Search Console API via service account credentials.
    Fetches data for yesterday (GSC has ~2 day lag, but we try yesterday).
    """
    if not settings.gsc_credentials_json:
        print("GSC credentials not configured. Skipping collection.")
        return

    db = get_supabase()

    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build

        # Parse service account credentials
        creds_data = json.loads(settings.gsc_credentials_json)
        credentials = Credentials.from_service_account_info(
            creds_data,
            scopes=["https://www.googleapis.com/auth/webmasters.readonly"],
        )

        service = build("searchconsole", "v1", credentials=credentials)

        # Fetch data for 3 days ago (GSC data has ~2-3 day lag)
        target_date = (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")

        # Query GSC for /posts/* pages
        response = (
            service.searchanalytics()
            .query(
                siteUrl=settings.gsc_site_url,
                body={
                    "startDate": target_date,
                    "endDate": target_date,
                    "dimensions": ["page", "query"],
                    "dimensionFilterGroups": [
                        {
                            "filters": [
                                {
                                    "dimension": "page",
                                    "operator": "contains",
                                    "expression": "/posts/",
                                }
                            ]
                        }
                    ],
                    "rowLimit": 5000,
                },
            )
            .execute()
        )

        rows = response.get("rows", [])
        if not rows:
            print(f"No GSC data for {target_date}")
            return

        # Group by page
        page_data: dict[str, dict] = {}
        for row in rows:
            page_url = row["keys"][0]
            query = row["keys"][1]

            # Extract path from URL
            path = page_url.replace(settings.gsc_site_url, "")
            if not path.startswith("/posts/"):
                continue

            if path not in page_data:
                page_data[path] = {
                    "page_path": path,
                    "date": target_date,
                    "clicks": 0,
                    "impressions": 0,
                    "ctr": 0.0,
                    "position": 0.0,
                    "queries": [],
                    "_position_sum": 0.0,
                    "_count": 0,
                }

            pd = page_data[path]
            pd["clicks"] += row.get("clicks", 0)
            pd["impressions"] += row.get("impressions", 0)
            pd["_position_sum"] += row.get("position", 0) * row.get("impressions", 1)
            pd["_count"] += 1
            pd["queries"].append(
                {
                    "query": query,
                    "clicks": row.get("clicks", 0),
                    "impressions": row.get("impressions", 0),
                    "ctr": row.get("ctr", 0),
                    "position": row.get("position", 0),
                }
            )

        # Calculate averages and upsert
        inserted = 0
        for path, pd in page_data.items():
            total_imp = pd["impressions"] or 1
            pd["ctr"] = pd["clicks"] / total_imp
            pd["position"] = pd["_position_sum"] / total_imp if total_imp > 0 else 0

            # Remove temp fields
            del pd["_position_sum"]
            del pd["_count"]

            # Keep top 20 queries by clicks
            pd["queries"] = sorted(pd["queries"], key=lambda q: q["clicks"], reverse=True)[:20]

            # Upsert into gsc_page_metrics
            try:
                db.table("gsc_page_metrics").upsert(
                    pd,
                    on_conflict="page_path,date",
                ).execute()
                inserted += 1
            except Exception as e:
                print(f"Error upserting {path}: {e}")

        print(f"GSC collection complete: {inserted} pages for {target_date}")

    except ImportError:
        print("google-api-python-client not installed. Skipping GSC collection.")
    except Exception as e:
        print(f"GSC collection error: {e}")
