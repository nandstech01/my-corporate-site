export interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

export interface MessageContent {
  text: string;
  isHeading: boolean;
}

// アニメーション関連の型
export interface AnimationConfig {
  sectionSpacing: string;
  cardSpacing: string;
  cardStyle: string;
  cardHover: {
    rest: any;
    hover: any;
  };
  headerParallax: {
    initial: any;
    animate: any;
  };
  fadeIn: {
    initial: any;
    animate: any;
    transition: any;
  };
  sectionGap: number;
  elementGap: number;
} 