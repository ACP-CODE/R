import * as vscode from "vscode";
import type { ProjectTier } from "../projectScaffold";
import { PROJECT_TIER_OPTIONS, type ProjectTierOption } from "./projectTierOptions";

interface TierQuickPickItem extends vscode.QuickPickItem {
    readonly tier?: ProjectTier;
}

const HELP_BUTTON: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon("question"),
    tooltip: "查看帮助文档",
};

/**
 * Shows the grouped, icon-and-help-button QuickPick for choosing a project tier
 * (R-DOMAIN §9.1). Resolves to the chosen tier, or undefined if the user
 * dismissed the picker without selecting anything.
 */
export function pickProjectTier(): Promise<ProjectTier | undefined> {
    return new Promise((resolve) => {
        const quickPick = vscode.window.createQuickPick<TierQuickPickItem>();
        quickPick.title = "R: Create Project";
        quickPick.placeholder = "选择要创建的项目类型";
        quickPick.items = buildItems();
        quickPick.matchOnDescription = true;

        let didAccept = false;
        quickPick.onDidTriggerItemButton((event) => openHelpFor(event.item.tier));
        quickPick.onDidAccept(() => acceptSelection(quickPick, resolve, () => (didAccept = true)));
        quickPick.onDidHide(() => finalizeOnHide(quickPick, resolve, () => didAccept));

        quickPick.show();
    });
}

function buildItems(): TierQuickPickItem[] {
    const items: TierQuickPickItem[] = [
        { label: "项目类型", kind: vscode.QuickPickItemKind.Separator },
    ];
    for (const option of PROJECT_TIER_OPTIONS) items.push(toQuickPickItem(option));
    // A future "模板" group (R-DOMAIN §9.2) is appended the same way: another
    // Separator item, then one TierQuickPickItem per template.
    return items;
}

function toQuickPickItem(option: ProjectTierOption): TierQuickPickItem {
    return {
        tier: option.tier,
        label: option.label,
        description: option.description,
        detail: option.detail,
        iconPath: new vscode.ThemeIcon(option.iconId),
        buttons: [HELP_BUTTON],
    };
}

function openHelpFor(tier: ProjectTier | undefined): void {
    const option = PROJECT_TIER_OPTIONS.find((candidate) => candidate.tier === tier);
    if (option) void vscode.env.openExternal(vscode.Uri.parse(option.helpUrl));
}

function acceptSelection(
    quickPick: vscode.QuickPick<TierQuickPickItem>,
    resolve: (tier: ProjectTier | undefined) => void,
    markAccepted: () => void,
): void {
    markAccepted();
    resolve(quickPick.selectedItems[0]?.tier);
    quickPick.hide();
}

function finalizeOnHide(
    quickPick: vscode.QuickPick<TierQuickPickItem>,
    resolve: (tier: ProjectTier | undefined) => void,
    didAccept: () => boolean,
): void {
    if (!didAccept()) resolve(undefined);
    quickPick.dispose();
}
