import type {
  ServiceStage,
  WorkItemType,
  WorkItemPriority,
  DocType,
} from '@/types/database';

export interface WBSWorkItemTemplate {
  title: string;
  description: string;
  type: WorkItemType;
  priority: WorkItemPriority;
}

export interface WBSDecisionTemplate {
  title: string;
  background: string;
}

export interface WBSDocumentTemplate {
  title: string;
  description: string;
  doc_type: DocType;
}

export interface WBSStageTemplate {
  stage_name: ServiceStage;
  summary: string;
  deliverables: string[];
  work_items: WBSWorkItemTemplate[];
  decisions: WBSDecisionTemplate[];
  documents: WBSDocumentTemplate[];
}

/**
 * Default WBS template for a full-cycle service development journey.
 * 7 stages (idea → enhancement), each with work items, decisions, and documents.
 */
export const DEFAULT_WBS_TEMPLATE: WBSStageTemplate[] = [
  // ── Stage 1: Idea ──
  {
    stage_name: 'idea',
    summary: '서비스 아이디어를 구체화하고 MVP 범위를 결정하는 단계',
    deliverables: ['서비스 컨셉 문서', '경쟁 분석 결과', 'MVP 범위 정의'],
    work_items: [
      {
        title: '[아이디어] 서비스 컨셉 정의',
        description: '서비스의 핵심 가치와 해결하고자 하는 문제를 정의합니다.',
        type: 'feature',
        priority: 'high',
      },
      {
        title: '[아이디어] 경쟁 서비스 분석',
        description: '유사 서비스를 조사하고 차별화 포인트를 도출합니다.',
        type: 'feature',
        priority: 'medium',
      },
      {
        title: '[아이디어] MVP 범위 결정',
        description: '최소 기능 제품의 범위를 정의하고 우선순위를 결정합니다.',
        type: 'feature',
        priority: 'high',
      },
    ],
    decisions: [
      {
        title: 'MVP 범위 결정',
        background: '제한된 리소스 내에서 핵심 가치를 전달할 최소 기능 세트를 결정해야 합니다.',
      },
    ],
    documents: [
      {
        title: '서비스 기획서',
        description: '서비스 비전, 목표, 대상 사용자, 핵심 기능을 정의하는 기획 문서',
        doc_type: 'planning',
      },
    ],
  },

  // ── Stage 2: Planning ──
  {
    stage_name: 'planning',
    summary: '기술 스택 선정, DB 설계, API 설계 등 기술적 기반을 수립하는 단계',
    deliverables: ['기술 요구사항 정의서', 'DB 스키마', 'API 명세서', '화면 설계서'],
    work_items: [
      {
        title: '[기획] 기술 스택 선정',
        description: 'Frontend, Backend, DB, 배포 환경 등 기술 스택을 선정합니다.',
        type: 'infra',
        priority: 'high',
      },
      {
        title: '[기획] DB 스키마 설계',
        description: '데이터 모델, 테이블 관계, 인덱스 전략을 설계합니다.',
        type: 'feature',
        priority: 'high',
      },
      {
        title: '[기획] API 엔드포인트 설계',
        description: 'REST/GraphQL API 엔드포인트와 데이터 계약을 정의합니다.',
        type: 'feature',
        priority: 'high',
      },
      {
        title: '[기획] 화면 구조 설계',
        description: '주요 화면 목록과 네비게이션 흐름을 설계합니다.',
        type: 'feature',
        priority: 'medium',
      },
    ],
    decisions: [
      {
        title: '기술 스택 선정',
        background: '프로젝트 요구사항에 맞는 기술 스택을 선택해야 합니다. 팀 역량, 생산성, 확장성을 고려합니다.',
      },
      {
        title: '아키텍처 패턴 결정',
        background: '모놀리식 vs 마이크로서비스, SSR vs CSR, 상태 관리 전략 등 아키텍처 방향을 결정합니다.',
      },
    ],
    documents: [
      {
        title: '기술 요구사항 정의서 (TRD)',
        description: '기술 스택, 성능 요구사항, 보안 요구사항 등을 정의',
        doc_type: 'planning',
      },
      {
        title: 'DB 설계서 (ERD)',
        description: '데이터베이스 스키마, 테이블 관계도, 마이그레이션 계획',
        doc_type: 'erd',
      },
      {
        title: 'API 명세서',
        description: 'API 엔드포인트, 요청/응답 형식, 인증 방식 정의',
        doc_type: 'api',
      },
    ],
  },

  // ── Stage 3: Design ──
  {
    stage_name: 'design',
    summary: 'UI/UX 디자인, 디자인 시스템, 프로토타입을 제작하는 단계',
    deliverables: ['와이어프레임', '디자인 시스템', '인터랙티브 프로토타입'],
    work_items: [
      {
        title: '[디자인] 와이어프레임 제작',
        description: '주요 화면의 레이아웃과 정보 구조를 와이어프레임으로 제작합니다.',
        type: 'feature',
        priority: 'high',
      },
      {
        title: '[디자인] 디자인 시스템 구축',
        description: '색상, 타이포그래피, 컴포넌트 라이브러리를 정의합니다.',
        type: 'feature',
        priority: 'medium',
      },
      {
        title: '[디자인] 프로토타입 제작',
        description: '핵심 사용자 흐름의 인터랙티브 프로토타입을 제작합니다.',
        type: 'feature',
        priority: 'medium',
      },
    ],
    decisions: [
      {
        title: '디자인 시스템 선택',
        background: '커스텀 디자인 vs 기존 UI 라이브러리 활용 여부를 결정합니다.',
      },
    ],
    documents: [
      {
        title: '디자인 가이드',
        description: '디자인 토큰, 컴포넌트 규격, 접근성 가이드라인',
        doc_type: 'architecture',
      },
    ],
  },

  // ── Stage 4: Development ──
  {
    stage_name: 'development',
    summary: '프로젝트 셋업, 인증, 핵심 기능을 구현하는 단계',
    deliverables: ['프로젝트 보일러플레이트', '인증 시스템', '핵심 기능 구현', 'API 연동'],
    work_items: [
      {
        title: '[개발] 프로젝트 초기 셋업',
        description: '프로젝트 구조, 린터, 포매터, CI/CD 기본 설정을 구성합니다.',
        type: 'infra',
        priority: 'high',
      },
      {
        title: '[개발] 인증 시스템 구현',
        description: '로그인, 회원가입, 세션 관리, 권한 체계를 구현합니다.',
        type: 'feature',
        priority: 'high',
      },
      {
        title: '[개발] 핵심 기능 구현',
        description: 'MVP에 포함된 핵심 기능을 구현합니다.',
        type: 'feature',
        priority: 'high',
      },
      {
        title: '[개발] API 연동',
        description: '프론트엔드와 백엔드 API를 연동하고 에러 핸들링을 구현합니다.',
        type: 'feature',
        priority: 'high',
      },
      {
        title: '[개발] DB 마이그레이션 실행',
        description: '설계된 스키마를 기반으로 DB 마이그레이션을 작성하고 실행합니다.',
        type: 'infra',
        priority: 'high',
      },
    ],
    decisions: [
      {
        title: '인증 방식 결정',
        background: 'JWT vs Session, OAuth 제공자 선택, 토큰 저장 방식 등 인증 전략을 결정합니다.',
      },
    ],
    documents: [
      {
        title: '개발 컨벤션 가이드',
        description: '코딩 컨벤션, 브랜치 전략, 커밋 규칙, PR 리뷰 프로세스',
        doc_type: 'architecture',
      },
    ],
  },

  // ── Stage 5: Testing ──
  {
    stage_name: 'testing',
    summary: '단위 테스트, 통합 테스트, QA를 수행하는 단계',
    deliverables: ['단위 테스트 커버리지', '통합 테스트', 'QA 결과 보고서'],
    work_items: [
      {
        title: '[테스트] 단위 테스트 작성',
        description: '핵심 비즈니스 로직과 유틸리티 함수의 단위 테스트를 작성합니다.',
        type: 'feature',
        priority: 'high',
      },
      {
        title: '[테스트] 통합 테스트 작성',
        description: 'API 엔드포인트와 컴포넌트 통합 테스트를 작성합니다.',
        type: 'feature',
        priority: 'medium',
      },
      {
        title: '[테스트] E2E 테스트 작성',
        description: '주요 사용자 시나리오의 E2E 테스트를 작성합니다.',
        type: 'feature',
        priority: 'medium',
      },
      {
        title: '[테스트] QA 및 버그 수정',
        description: '수동 QA를 수행하고 발견된 버그를 수정합니다.',
        type: 'bug',
        priority: 'high',
      },
    ],
    decisions: [],
    documents: [
      {
        title: '테스트 계획서',
        description: '테스트 전략, 커버리지 목표, 테스트 환경, 시나리오 목록',
        doc_type: 'planning',
      },
    ],
  },

  // ── Stage 6: Launch ──
  {
    stage_name: 'launch',
    summary: '배포 환경 구성, CI/CD 설정, 프로덕션 배포를 수행하는 단계',
    deliverables: ['배포 파이프라인', '모니터링 대시보드', '프로덕션 배포'],
    work_items: [
      {
        title: '[런칭] 배포 환경 구성',
        description: '스테이징/프로덕션 서버 환경을 구성합니다.',
        type: 'infra',
        priority: 'high',
      },
      {
        title: '[런칭] CI/CD 파이프라인 설정',
        description: '자동 빌드, 테스트, 배포 파이프라인을 구성합니다.',
        type: 'infra',
        priority: 'high',
      },
      {
        title: '[런칭] 모니터링/로깅 설정',
        description: '에러 추적, 성능 모니터링, 로그 수집 시스템을 설정합니다.',
        type: 'infra',
        priority: 'medium',
      },
      {
        title: '[런칭] 프로덕션 배포',
        description: '최종 점검 후 프로덕션 환경에 배포합니다.',
        type: 'infra',
        priority: 'urgent',
      },
    ],
    decisions: [
      {
        title: '배포 전략 결정',
        background: '배포 플랫폼(Vercel/AWS/GCP), 배포 방식(Blue-Green/Rolling/Canary)을 결정합니다.',
      },
    ],
    documents: [
      {
        title: '배포 가이드',
        description: '배포 절차, 환경변수 목록, 롤백 프로세스, 장애 대응 매뉴얼',
        doc_type: 'architecture',
      },
    ],
  },

  // ── Stage 7: Enhancement ──
  {
    stage_name: 'enhancement',
    summary: '사용자 피드백 수집, 성능 최적화, 기능 개선을 수행하는 단계',
    deliverables: ['사용자 피드백 보고서', '성능 개선 결과', '차기 버전 계획'],
    work_items: [
      {
        title: '[개선] 사용자 피드백 수집 및 분석',
        description: '사용자 피드백을 수집하고 개선 사항을 도출합니다.',
        type: 'feature',
        priority: 'medium',
      },
      {
        title: '[개선] 성능 최적화',
        description: '로딩 속도, 번들 크기, DB 쿼리 성능을 최적화합니다.',
        type: 'refactor',
        priority: 'medium',
      },
      {
        title: '[개선] 기능 개선 및 확장',
        description: '피드백 기반으로 기존 기능을 개선하고 새 기능을 추가합니다.',
        type: 'feature',
        priority: 'medium',
      },
    ],
    decisions: [],
    documents: [
      {
        title: '운영 매뉴얼',
        description: '서비스 운영 절차, 장애 대응, 데이터 백업/복구 가이드',
        doc_type: 'other',
      },
    ],
  },
];

/**
 * Get total count of items that will be generated from a template.
 */
export function getWBSTemplateSummary(template: WBSStageTemplate[] = DEFAULT_WBS_TEMPLATE) {
  return {
    stages: template.length,
    workItems: template.reduce((sum, s) => sum + s.work_items.length, 0),
    decisions: template.reduce((sum, s) => sum + s.decisions.length, 0),
    documents: template.reduce((sum, s) => sum + s.documents.length, 0),
  };
}
