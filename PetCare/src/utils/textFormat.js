export const toTitleCase = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';

    return text[0].toLocaleUpperCase('vi-VN') + text.slice(1);
};

export const toSentenceCase = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    const lowered = text.toLocaleLowerCase('vi-VN');
    return lowered.charAt(0).toLocaleUpperCase('vi-VN') + lowered.slice(1);
};

export const capitalizeFirstText = (value) => {
    const text = String(value || '').trim().replace(/\s+/g, ' ');
    if (!text) return '';
    return text.charAt(0).toLocaleUpperCase('vi-VN') + text.slice(1);
};

export const toDisplayName = (value, fallback = '--') => {
    const formatted = toTitleCase(value);
    return formatted || fallback;
};
