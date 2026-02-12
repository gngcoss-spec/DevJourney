import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BentoGrid, BentoCard, BentoCardHeader, BentoCardTitle, BentoCardValue } from '@/components/ui/bento-grid';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge } from '@/components/common/status-badge';
import { FilterPills } from '@/components/common/filter-pills';
import { IconWrapper } from '@/components/common/icon-wrapper';
import { Modal } from '@/components/common/modal';
import { Activity } from 'lucide-react';

describe('BentoGrid', () => {
  it('renders children in a grid', () => {
    render(
      <BentoGrid columns={4}>
        <div>Item 1</div>
        <div>Item 2</div>
      </BentoGrid>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies column class based on columns prop', () => {
    const { container } = render(
      <BentoGrid columns={2}>
        <div>Child</div>
      </BentoGrid>
    );
    expect(container.firstChild).toHaveClass('md:grid-cols-2');
  });
});

describe('BentoCard', () => {
  it('renders with bento-glass class', () => {
    render(<BentoCard>Content</BentoCard>);
    const card = screen.getByTestId('bento-card');
    expect(card).toHaveClass('bento-glass');
  });

  it('applies col-span-full for colSpan="full"', () => {
    render(<BentoCard colSpan="full">Full Width</BentoCard>);
    const card = screen.getByTestId('bento-card');
    expect(card).toHaveClass('col-span-full');
  });

  it('applies interactive classes when interactive prop is true', () => {
    render(<BentoCard interactive>Interactive</BentoCard>);
    const card = screen.getByTestId('bento-card');
    expect(card).toHaveClass('bento-glass-hover');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('renders sub-components correctly', () => {
    render(
      <BentoCard>
        <BentoCardHeader>
          <BentoCardTitle>Title</BentoCardTitle>
        </BentoCardHeader>
        <BentoCardValue>42</BentoCardValue>
      </BentoCard>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('renders title with display typography', () => {
    render(<PageHeader title="Dashboard" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Dashboard');
    expect(heading).toHaveClass('text-display');
  });

  it('renders description when provided', () => {
    render(<PageHeader title="Title" description="Some description" />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('renders action slot children', () => {
    render(
      <PageHeader title="Title">
        <button>Action</button>
      </PageHeader>
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('renders with success variant', () => {
    render(<StatusBadge variant="success">Active</StatusBadge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with warning variant', () => {
    render(<StatusBadge variant="warning">Stalled</StatusBadge>);
    expect(screen.getByText('Stalled')).toBeInTheDocument();
  });

  it('renders with danger variant', () => {
    render(<StatusBadge variant="danger">Offline</StatusBadge>);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
});

describe('FilterPills', () => {
  const options = [
    { value: 'all' as const, label: '전체' },
    { value: 'work_item' as const, label: '작업' },
    { value: 'decision' as const, label: '의사결정' },
  ];

  it('renders all options', () => {
    render(<FilterPills options={options} value="all" onChange={() => {}} />);
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('작업')).toBeInTheDocument();
    expect(screen.getByText('의사결정')).toBeInTheDocument();
  });

  it('marks active option with aria-selected', () => {
    render(<FilterPills options={options} value="work_item" onChange={() => {}} />);
    expect(screen.getByText('작업')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('전체')).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPills options={options} value="all" onChange={onChange} />);

    await user.click(screen.getByText('작업'));
    expect(onChange).toHaveBeenCalledWith('work_item');
  });
});

describe('IconWrapper', () => {
  it('renders the provided icon', () => {
    const { container } = render(<IconWrapper icon={Activity} color="green" size="md" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container } = render(<IconWrapper icon={Activity} size="lg" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('p-2.5');
  });
});

describe('Modal', () => {
  it('renders when isOpen is true', () => {
    render(<Modal isOpen onClose={() => {}}>Content</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={() => {}}>Content</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal isOpen onClose={() => {}} title="Test Modal">Content</Modal>);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });
});
