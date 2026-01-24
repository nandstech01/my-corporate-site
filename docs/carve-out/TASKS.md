# Carve-Out Ready 実装タスク管理

**最終更新**: 2026-01-19
**ステータス**: Phase 0-6 全完了
**次アクション**: SaaS Product Phase 5 実験 → [`/docs/saas-product/TASKS.md`](../saas-product/TASKS.md)

---

## 現在のステータス

| Phase | 状態 | 内容 |
|-------|------|------|
| Phase 0 | ✅ 完了 | 準備・検証 |
| Phase 1 | ✅ 完了 | データベース境界（clavi スキーマ） |
| Phase 2 | ✅ 完了 | 認証境界（JWT custom claim） |
| Phase 3 | ✅ 完了 | RLS ポリシー（7ポリシー） |
| Phase 4 | ✅ 完了 | API境界（/api/clavi/*） |
| Phase 5 | ✅ 完了 | ジョブ基盤（Cloud Run OIDC） |
| Phase 6 | ✅ 完了 | 招待・CRUD機能 |

---

## 安全原則（必守）

```
✅ 許可:
- 新規スキーマ作成（clavi.*）
- 新規テーブル作成（clavi.* 配下のみ）
- 新規API作成（/api/clavi/* のみ）
- 新規ページ作成（/clavi/* のみ）

❌ 禁止:
- 既存テーブルの変更（public.*）
- 既存APIの変更（/api/* 既存）
- 既存認証フローの変更
```

---

## 実装済みコンポーネント

### データベース（clavi スキーマ）

| テーブル | 説明 |
|---------|------|
| `clavi.tenants` | テナント管理 |
| `clavi.user_tenants` | ユーザー↔テナント紐付け |
| `clavi.invitations` | 招待管理 |
| `clavi.job_users` | ジョブ専用ユーザー |
| `clavi.audit_log` | 監査ログ |

### 関数・RPC

| 関数 | 説明 |
|------|------|
| `clavi.current_tenant_id()` | JWT claimからテナントID取得 |
| `clavi.current_tenant_role()` | JWT claimからテナントロール取得 |
| `clavi.get_current_tenant_context()` | テナントコンテキスト取得 |
| `clavi.onboard()` | 新規テナント作成 |
| `clavi.get_or_create_job_user()` | ジョブユーザー作成 |
| `clavi.create_invitation()` | 招待トークン生成 |
| `clavi.accept_invitation()` | 招待受諾 |
| `clavi.update_tenant()` | テナント更新 |
| `clavi.delete_tenant()` | テナント削除 |
| `clavi.list_members()` | メンバー一覧 |
| `clavi.update_member_role()` | メンバーロール更新 |
| `clavi.remove_member()` | メンバー削除 |
| `clavi.log_audit()` | 監査ログ記録 |

### RLS ポリシー（7つ）

1. `tenants_select` - SELECT（user_tenants所属確認）
2. `tenants_update` - UPDATE（owner/admin）
3. `user_tenants_select` - SELECT（current_tenant + 所属確認）
4. `user_tenants_insert` - INSERT（owner/admin）
5. `user_tenants_insert_onboard` - INSERT（未所属者 → owner登録）
6. `user_tenants_update` - UPDATE（ownerのみ）
7. `user_tenants_delete` - DELETE（ownerのみ）

### 認証

- JWT custom claim hook: `public.custom_access_token_hook()`
- テナントID埋め込み: `https://nands.tech/tenant_id`
- テナントロール埋め込み: `https://nands.tech/tenant_role`

---

## マイグレーションファイル

| ファイル | 内容 |
|---------|------|
| `20250110000000_create_partner_system.sql` | テナント基盤 |
| `20250110000100_create_job_users.sql` | ジョブユーザー |
| `20250110000101_create_get_or_create_job_user_rpc.sql` | ジョブユーザーRPC |
| `20250110000102_create_audit_log.sql` | 監査ログ |
| `20250110000103_create_log_audit_function.sql` | 監査ログ関数 |
| `20250110000104_create_cleanup_audit_logs_function.sql` | 監査ログクリーンアップ |
| `20250110000105_update_hook_for_tenant_switch.sql` | テナント切替Hook |
| `20250110000106_create_public_rpc_wrappers.sql` | public RPCラッパー |
| `20250110000107_create_public_views.sql` | publicビュー |
| `20260120000000_create_invitations_table.sql` | 招待テーブル |
| `20260120000001_create_invitation_rpc.sql` | 招待RPC |
| `20260120000002_accept_invitation_rpc.sql` | 招待受諾RPC |
| `20260120000003_tenant_crud_rpc.sql` | テナントCRUD RPC |
| `20260120000004_member_crud_rpc.sql` | メンバーCRUD RPC |

---

## 緊急時の対応

RLSロールバック: [`RLS_ROLLBACK.sql`](./RLS_ROLLBACK.sql)

```bash
# マイグレーションのロールバック
supabase db reset --db-url postgres://...

# 環境変数の削除（Vercel Dashboard）

# デプロイの巻き戻し
vercel rollback
```

---

## 設計原則（3原則）

1. **外部依存ゼロ**: ジョブユーザーは `@example.invalid` ドメイン（RFC 2606予約）
2. **スケール耐性**: `clavi.job_users` からO(1)正引き（listUsers不使用）
3. **冗長性排除**: OIDCのみ認証（内部APIキー廃止）

---

## 変更履歴

| 日付 | Phase | 内容 |
|------|-------|------|
| 2026-01-19 | - | ドキュメント整理 |
| 2026-01-18 | Phase 6 | 招待・CRUD機能完了 |
| 2025-01-10 | Phase 0-5 | Carve-Out基盤完了 |

---

**SaaS Product実装**: [`/docs/saas-product/TASKS.md`](../saas-product/TASKS.md)
