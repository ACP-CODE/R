/**
 * Replace everything between <!-- START_GENERATED_<MARKER> --> and
 * <!-- END_GENERATED_<MARKER> --> with `generated`. If the marker pair isn't
 * present, the README is returned unchanged — a section that doesn't exist
 * yet isn't an error, it's just nothing to update.
 */
export function replaceMarkerSection(readme: string, marker: string, generated: string): string {
    const START = `<!-- START_GENERATED_${marker} -->`;
    const END = `<!-- END_GENERATED_${marker} -->`;

    const startIdx = readme.indexOf(START);
    const endIdx = readme.indexOf(END);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return readme;

    const before = readme.slice(0, startIdx + START.length);
    const after = readme.slice(endIdx);
    return `${before}\n${generated.trim()}\n${after}`;
}
