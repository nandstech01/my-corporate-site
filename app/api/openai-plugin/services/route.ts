import { NextRequest, NextResponse } from 'next/server';

/**
 * 🚀 OpenAI Plugin - サービス情報API
 * エヌアンドエスの全サービス情報を提供
 */

interface Service {
  name: string;
  description: string;
  url: string;
  category: string;
}

interface ServicesResponse {
  services: Service[];
}

const NANDS_SERVICES: Service[] = [
  {
    name: "AI Agent Development",
    description: "Custom AI agent development using latest models like ChatGPT and Claude. Automate business processes and enhance customer support efficiency.",
    url: "https://nands.tech/ai-agents",
    category: "AI Development"
  },
  {
    name: "AIO Marketing",
    description: "AI Search Optimization (AIO) for digital marketing. Improve AI citation rates using relevance engineering techniques.",
    url: "https://nands.tech/aio-seo",
    category: "Marketing"
  },
  {
    name: "Chatbot Development",
    description: "Advanced enterprise chatbot development. Natural language processing and RAG technology for human-like conversations.",
    url: "https://nands.tech/chatbot-development",
    category: "AI Development"
  },
  {
    name: "Vector RAG Construction",
    description: "Vector RAG (Retrieval-Augmented Generation) systems using enterprise data. Accurate information retrieval and answer generation.",
    url: "https://nands.tech/vector-rag",
    category: "AI Development"
  },
  {
    name: "AI Video Generation",
    description: "Automated AI-powered video generation solutions for marketing, education, and entertainment industries.",
    url: "https://nands.tech/video-generation",
    category: "AI Development"
  },
  {
    name: "HR Solutions",
    description: "AI-powered human resources and recruitment systems. Automated candidate screening and evaluation.",
    url: "https://nands.tech/hr-solutions",
    category: "HR & Recruitment"
  },
  {
    name: "SNS Automation",
    description: "AI-driven social media marketing automation. Content generation, posting scheduling, and engagement analysis.",
    url: "https://nands.tech/sns-automation",
    category: "Marketing"
  },
  {
    name: "System Development",
    description: "AI-integrated web application and system development using modern tech stack including Next.js, React, and Node.js.",
    url: "https://nands.tech/system-development",
    category: "System Development"
  },
  {
    name: "MCP Servers",
    description: "Model Context Protocol (MCP) compliant server development for efficient integration with AI models like Claude.",
    url: "https://nands.tech/mcp-servers",
    category: "AI Development"
  },
  {
    name: "Enterprise AI Consulting",
    description: "Comprehensive AI consulting including strategy, technology selection, and implementation support. Maximize ROI while minimizing risks.",
    url: "https://nands.tech/corporate",
    category: "Consulting"
  },
  {
    name: "AI Site Construction",
    description: "Website construction with AI citation-optimized design. Fragment ID, structured data, and relevance engineering implementation.",
    url: "https://nands.tech/ai-site",
    category: "AI Development"
  }
];

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let filteredServices = NANDS_SERVICES;

    // カテゴリフィルタリング
    if (category) {
      filteredServices = NANDS_SERVICES.filter(
        service => service.category.toLowerCase() === category.toLowerCase()
      );
    }

    const response: ServicesResponse = {
      services: filteredServices
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // 1時間キャッシュ
        'X-Services-Count': filteredServices.length.toString(),
        'X-Available-Categories': Array.from(new Set(NANDS_SERVICES.map(s => s.category))).join(',')
      }
    });

  } catch (error) {
    console.error('OpenAI Plugin Services API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Services retrieval failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 