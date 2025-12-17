export default function HelpPage() {
    return (
        <div className="page-layout" style={{ marginTop: '20px' }}>
            <div className="card" style={{ width: '100%', padding: '40px' }}>
                <h1 style={{ marginBottom: '20px' }}>Help Center</h1>
                <p>Welcome to the Reddit Help Center. Here you can find answers to frequently asked questions.</p>
                <ul style={{ marginTop: '20px', marginLeft: '20px', lineHeight: '2' }}>
                    <li>How do I create a post?</li>
                    <li>How do I create a community?</li>
                    <li>What is Karma?</li>
                </ul>
            </div>
        </div>
    );
}
