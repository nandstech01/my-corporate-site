import './sns-header.css';

export default function SNSAutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.body.classList.add('sns-automation-page');
            window.addEventListener('beforeunload', function() {
              document.body.classList.remove('sns-automation-page');
            });
          `,
        }}
      />
      {children}
    </>
  );
}
