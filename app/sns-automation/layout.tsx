import './sns-header.css';

export default function SNSAutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sns-automation-content">
      {children}
    </div>
  );
}
