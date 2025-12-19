'use client';

import { useState, useRef, useEffect } from 'react';
import { FaCalendar, FaChevronDown } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './BestFilters.module.css';

const CATEGORIES = [
    'All', 'German', 'English', 'Spanish', 'Filipino',
    'French', 'Hindi', 'Italian', 'Dutch', 'Polish', 'Portuguese'
];

const YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];

export default function BestFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL or defaults
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '2025');
    const [isYearOpen, setIsYearOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsYearOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const updateFilter = (type, value) => {
        const params = new URLSearchParams(searchParams);
        if (type === 'year') {
            setSelectedYear(value);
            params.set('year', value);
        } else if (type === 'category') {
            setSelectedCategory(value);
            params.set('category', value);
        }
        router.push(`/best?${params.toString()}`);
    };

    return (
        <div className={styles.filterBar}>
            <div className={styles.yearWrapper} ref={dropdownRef}>
                <button
                    className={styles.yearDropdown}
                    onClick={() => setIsYearOpen(!isYearOpen)}
                >
                    <FaCalendar size={12} />
                    {selectedYear}
                    <FaChevronDown size={10} style={{ marginLeft: 4 }} />
                </button>

                {isYearOpen && (
                    <div className={styles.dropdownMenu}>
                        {YEARS.map(year => (
                            <button
                                key={year}
                                className={`${styles.dropdownItem} ${selectedYear === year ? styles.active : ''}`}
                                onClick={() => {
                                    updateFilter('year', year);
                                    setIsYearOpen(false);
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.categories}>
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        className={`${styles.categoryPill} ${selectedCategory === category ? styles.active : ''}`}
                        onClick={() => updateFilter('category', category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
