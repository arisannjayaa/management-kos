import { useEffect, useState } from 'react';

export function useDebounceSearch(
    value: string | undefined,
    delay = 400,
    callback?: (value: string) => void,
) {
    const [search, setSearch] = useState(value ?? '');

    useEffect(() => {
        const timer = setTimeout(() => {
            callback?.(search);
        }, delay);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setSearch(value ?? '');
    }, [value]);

    return {
        search,
        setSearch,
    };
}
