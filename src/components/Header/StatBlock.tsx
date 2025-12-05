interface StatItem {
  label: string;
  value: string | number;
}

interface StatBlockProps {
  items: StatItem[];
}

export function StatBlock({ items }: StatBlockProps) {
  return (
    <div className="balance-container">
      {items.map((item) => (
        <div className="text-info" key={item.label}>
          <p className="text-bal">{item.label}</p>
          <p className="text-stat">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
