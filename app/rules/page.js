export default function RulesPage() {
    return (
        <div className="page-layout" style={{ marginTop: '20px' }}>
            <div className="card" style={{ width: '100%', padding: '40px' }}>
                <h1 style={{ marginBottom: '20px' }}>Reddit Rules & Roles</h1>
                <p>These are the core rules of Reddit to ensure a safe and welcoming environment.</p>
                <ol style={{ marginTop: '20px', marginLeft: '20px', lineHeight: '2' }}>
                    <li>Remember the human</li>
                    <li>Behave like you would in real life</li>
                    <li>Look for the original source of content</li>
                    <li>Search for duplicates before posting</li>
                    <li>Read the community's rules</li>
                </ol>
            </div>
        </div>
    );
}
