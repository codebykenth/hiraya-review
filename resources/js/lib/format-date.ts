export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
        return 'Never';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return 'Never';
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
