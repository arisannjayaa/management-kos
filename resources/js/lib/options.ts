export function optionLabel(
    options: { value: string; label: string }[],
    value?: string,
) {
    return options.find((item) => item.value === value)?.label ?? '—';
}
