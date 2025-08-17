export const utils = {
    capitalize: (value: string) => {
        if (value.length === 0) return value;
        if (value.length === 1) return value.toUpperCase();
        return (value.charAt(0).toUpperCase() + value.slice(1)).replace('_', " ");
    }
}