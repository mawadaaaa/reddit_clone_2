'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState({ users: [], communities: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetch(`/api/search?q=${query}`)
                .then(res => res.json())
                .then(data => {
                    setResults(data);
                    setLoading(false);
                });
        }
    }, [query]);

    if (!query) return <div className="container" style={{ marginTop: '20px' }}>Type something to search</div>;
    if (loading) return <div className="container" style={{ marginTop: '20px' }}>Loading...</div>;

    return (
        <div className="container" style={{ marginTop: '20px' }}>
            <h1>Search results for "{query}"</h1>

            <div style={{ marginTop: '24px' }}>
                <h3>Communities</h3>
                {results.communities.length === 0 ? <p>No communities found</p> : (
                    <div className="card">
                        {results.communities.map(c => (
                            <div key={c._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                <Link href={`/r/${c.name}`} style={{ fontWeight: 'bold' }}>r/{c.name}</Link>
                                <p style={{ fontSize: '14px', color: '#666' }}>{c.members.length} members</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '24px' }}>
                <h3>Users</h3>
                {results.users.length === 0 ? <p>No users found</p> : (
                    <div className="card">
                        {results.users.map(u => (
                            <div key={u._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                <Link href={`/u/${u.username}`} style={{ fontWeight: 'bold' }}>u/{u.username}</Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
}
