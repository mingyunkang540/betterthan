"""Render deterministic room Visual QA screenshots without changing app code.

The renderer reads the production slot/item definitions and asset map, then
applies the same bottom-center/contain calculation used by src/pages/room.tsx.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DEFINITIONS_PATH = ROOT / "src/constants/room-definitions.ts"
ASSET_MAP_PATH = ROOT / "scripts/embed-room-assets.cjs"
OUTPUT_ROOT = ROOT / "visual-qa/room-assets-2026-07-25"
SCREENSHOT_DIR = OUTPUT_ROOT / "screenshots"
CONTACT_DIR = OUTPUT_ROOT / "contact-sheets"
REVIEW_PATH = OUTPUT_ROOT / "review-findings.json"
DESIGN_WIDTH = 768
DESIGN_HEIGHT = 1024
VIEWPORT_WIDTHS = (360, 390, 430)


@dataclass(frozen=True)
class Slot:
    id: str
    x: float
    y: float
    width: float
    height: float
    z_index: int


@dataclass(frozen=True)
class Item:
    id: str
    name: str
    category: str
    slot_id: str
    asset_id: str
    scale: float = 1
    offset_x: float = 0
    offset_y: float = 0
    allowed_slot_ids: tuple[str, ...] = ()


def field(block: str, name: str, default: str | None = None) -> str:
    match = re.search(rf"\b{name}:\s*'([^']+)'", block)
    if match:
        return match.group(1)
    if default is not None:
        return default
    raise ValueError(f"Missing {name} in {block[:100]}")


def number(block: str, name: str, default: float | None = None) -> float:
    match = re.search(rf"\b{name}:\s*(-?\d+(?:\.\d+)?)", block)
    if match:
        return float(match.group(1))
    if default is not None:
        return default
    raise ValueError(f"Missing {name} in {block[:100]}")


def object_blocks(source: str) -> list[str]:
    return re.findall(r"\{[^{}]*\}", source, re.DOTALL)


def load_definitions() -> tuple[dict[str, Slot], dict[str, Item]]:
    source = DEFINITIONS_PATH.read_text(encoding="utf-8")
    slots_source = source.split(
        "export const STUDIO_001_SLOTS: RoomSlotDefinition[] = [", 1
    )[1].split("];", 1)[0]
    items_source = source.split(
        "export const ROOM_ITEMS: RoomItemDefinition[] = [", 1
    )[1].split("];", 1)[0]

    slots: dict[str, Slot] = {}
    for block in object_blocks(slots_source):
        slot_id = field(block, "id")
        slots[slot_id] = Slot(
            id=slot_id,
            x=number(block, "x"),
            y=number(block, "y"),
            width=number(block, "width"),
            height=number(block, "height"),
            z_index=int(number(block, "zIndex")),
        )

    items: dict[str, Item] = {}
    for block in object_blocks(items_source):
        item_id = field(block, "id")
        allowed_match = re.search(
            r"allowedSlotIds:\s*\[([^\]]*)\]", block, re.DOTALL
        )
        allowed = (
            tuple(re.findall(r"'([^']+)'", allowed_match.group(1)))
            if allowed_match
            else ()
        )
        items[item_id] = Item(
            id=item_id,
            name=field(block, "name"),
            category=field(block, "category"),
            slot_id=field(block, "slotId"),
            asset_id=field(block, "assetId"),
            scale=number(block, "scale", 1),
            offset_x=number(block, "renderOffsetX", 0),
            offset_y=number(block, "renderOffsetY", 0),
            allowed_slot_ids=allowed,
        )
    return slots, items


def load_asset_map() -> dict[str, Path]:
    source = ASSET_MAP_PATH.read_text(encoding="utf-8")
    pairs = re.findall(
        r"(?:'([^']+)'|(roomBackground)):\s*'([^']+)'", source, re.DOTALL
    )
    result = {(quoted or bare): ROOT / path for quoted, bare, path in pairs}
    missing = [f"{key}: {path}" for key, path in result.items() if not path.exists()]
    if missing:
        raise FileNotFoundError("\n".join(missing))
    return result


def item_asset_id(item: Item, slot_id: str) -> str:
    if item.category != "PLANT":
        return item.asset_id
    if item.id in {"plant-olive", "plant-succulent", "plant-fern", "plant-fiddle"}:
        return item.asset_id
    return {
        "SIDE_TABLE_SLOT": "plant-desk",
        "FLOOR_LAMP_SLOT": "plant-shelf",
        "PLANT_SLOT_2": "plant-window",
        "PLANT_SLOT_1": "plant-floor",
    }.get(slot_id, item.asset_id)


def contain(image: Image.Image, width: int, height: int) -> Image.Image:
    result = Image.new("RGBA", (max(width, 1), max(height, 1)), (0, 0, 0, 0))
    copy = image.convert("RGBA")
    copy.thumbnail((max(width, 1), max(height, 1)), Image.Resampling.LANCZOS)
    result.alpha_composite(copy, ((result.width - copy.width) // 2, (result.height - copy.height) // 2))
    return result


def rounded_scene(scene: Image.Image, radius: int) -> Image.Image:
    mask = Image.new("L", scene.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, scene.width - 1, scene.height - 1), radius=radius, fill=255
    )
    scene.putalpha(mask)
    return scene


def render_scene(
    slots: dict[str, Slot],
    items: dict[str, Item],
    asset_map: dict[str, Path],
    placements: dict[str, str],
    viewport_width: int,
) -> tuple[Image.Image, list[dict[str, Any]]]:
    scale = viewport_width / DESIGN_WIDTH
    height = round(DESIGN_HEIGHT * scale)
    background = Image.open(asset_map["roomBackground"]).convert("RGBA")
    scene = contain(background, viewport_width, height)
    measurements: list[dict[str, Any]] = []
    layers: list[tuple[int, str, str, Image.Image, int, int]] = []

    if placements.get("DESK_SLOT"):
        diary = Image.open(asset_map["diary-book"]).convert("RGBA")
        width = round(92 * scale)
        item_height = round(78 * scale)
        layers.append(
            (38, "diary-book", "DESK_SLOT", contain(diary, width, item_height), round(268 * scale), round(502 * scale))
        )

    for slot in sorted(slots.values(), key=lambda value: value.z_index):
        item_id = placements.get(slot.id)
        if not item_id:
            continue
        item = items[item_id]
        asset_id = item_asset_id(item, slot.id)
        asset = Image.open(asset_map[asset_id]).convert("RGBA")
        width = round(slot.width * scale * item.scale)
        item_height = round(slot.height * scale * item.scale)
        left = round(slot.x * scale - width / 2 + item.offset_x * scale)
        top = round(slot.y * scale - item_height + item.offset_y * scale)
        layers.append(
            (
                slot.z_index,
                item.id,
                slot.id,
                contain(asset, width, item_height),
                left,
                top,
            )
        )

    for z_index, item_id, slot_id, layer, left, top in sorted(layers):
        scene.alpha_composite(layer, (left, top))
        alpha_bbox = layer.getchannel("A").getbbox()
        visible_bbox = (
            [left + alpha_bbox[0], top + alpha_bbox[1], left + alpha_bbox[2], top + alpha_bbox[3]]
            if alpha_bbox
            else None
        )
        measurements.append(
            {
                "itemId": item_id,
                "assetId": item_asset_id(items[item_id], slot_id)
                if item_id in items
                else item_id,
                "slotId": slot_id,
                "x": left,
                "y": top,
                "width": layer.width,
                "height": layer.height,
                "zIndex": z_index,
                "renderOffsetX": items[item_id].offset_x if item_id in items else 0,
                "renderOffsetY": items[item_id].offset_y if item_id in items else 0,
                "visibleAlphaBounds": visible_bbox,
                "clipped": bool(
                    visible_bbox
                    and (
                        visible_bbox[0] < 0
                        or visible_bbox[1] < 0
                        or visible_bbox[2] > viewport_width
                        or visible_bbox[3] > height
                    )
                ),
            }
        )

    return rounded_scene(scene, round(28 * scale)), measurements


def allowed_slots(item: Item) -> tuple[str, ...]:
    return item.allowed_slot_ids or (item.slot_id,)


def build_cases(
    slots: dict[str, Slot], items: dict[str, Item]
) -> list[dict[str, Any]]:
    cases: list[dict[str, Any]] = [
        {
            "caseId": "CASE_001",
            "name": "EMPTY_ROOM",
            "viewportWidth": 390,
            "placements": {},
        }
    ]
    case_number = 2
    for item in items.values():
        for slot_id in allowed_slots(item):
            cases.append(
                {
                    "caseId": f"CASE_{case_number:03d}",
                    "name": f"SINGLE_{item.id}_{slot_id}",
                    "viewportWidth": 390,
                    "placements": {slot_id: item.id},
                }
            )
            case_number += 1

    relations = [
        (
            "CASE_101",
            "DESK_SET",
            {
                "DESK_SLOT": "desk-basic",
                "CHAIR_SLOT": "chair-cushion",
                "DESK_DRINK_SLOT": "drink-coffee",
            },
        ),
        (
            "CASE_102",
            "SHELF_SET",
            {
                "SHELF_SLOT": "shelf-basic",
                "FLOOR_LAMP_SLOT": "plant-pothos",
            },
        ),
        (
            "CASE_103",
            "BED_SET",
            {
                "BED_SLOT": "bed-basic",
                "APPLIANCE_SLOT": "bookcase-small",
                "WALL_ART_SLOT": "wall-calendar",
            },
        ),
        (
            "CASE_104",
            "PET_SET",
            {
                "PET_SLOT": "pet-cat",
                "PET_SLOT_2": "pet-dog",
                "RUG_SLOT": "rug-round",
                "PLANT_SLOT_1": "plant-fiddle",
            },
        ),
        (
            "CASE_105",
            "WINDOW_SET",
            {
                "WALL_DECOR_SLOT": "curtain-linen",
                "PLANT_SLOT_2": "plant-pothos",
            },
        ),
    ]
    for case_id, name, placements in relations:
        cases.append(
            {
                "caseId": case_id,
                "name": name,
                "viewportWidth": 390,
                "placements": placements,
            }
        )

    stress = {
        "RUG_SLOT": "rug-round",
        "BED_SLOT": "bed-princess",
        "DESK_SLOT": "desk-walnut-drawers",
        "DESK_DRINK_SLOT": "drink-barley",
        "SIDE_TABLE_SLOT": "plant-succulent",
        "CHAIR_SLOT": "chair-rattan-blue",
        "WALL_ART_SLOT": "wall-poster",
        "FLOOR_LAMP_SLOT": "plant-pothos",
        "PLANT_SLOT_1": "plant-fiddle",
        "PLANT_SLOT_2": "plant-succulent",
        "PET_SLOT": "pet-cat-gray",
        "PET_SLOT_2": "pet-dog-brown",
        "WALL_DECOR_SLOT": "curtain-linen",
        "SHELF_SLOT": "shelf-navy",
        "APPLIANCE_SLOT": "bookcase-small",
    }
    cases.append(
        {
            "caseId": "CASE_201",
            "name": "FULL_ROOM_STRESS",
            "viewportWidth": 390,
            "placements": stress,
        }
    )
    for index, viewport_width in enumerate(VIEWPORT_WIDTHS, 301):
        cases.append(
            {
                "caseId": f"CASE_{index}",
                "name": f"RESPONSIVE_{viewport_width}",
                "viewportWidth": viewport_width,
                "placements": stress,
            }
        )
    return cases


def safe_filename(case: dict[str, Any]) -> str:
    return f"room-{case['caseId'].lower()}-{case['name'].lower()}-{case['viewportWidth']}.png"


def make_contact_sheet(
    cases: list[dict[str, Any]],
    title: str,
    output_name: str,
    columns: int = 4,
) -> None:
    thumb_width = 210
    thumb_height = 280
    label_height = 46
    rows = (len(cases) + columns - 1) // columns
    sheet = Image.new(
        "RGB",
        (columns * thumb_width, 42 + rows * (thumb_height + label_height)),
        "#F7F4EF",
    )
    draw = ImageDraw.Draw(sheet)
    draw.text((12, 12), title, fill="#1B2430", font=ImageFont.load_default())
    for index, case in enumerate(cases):
        screenshot = Image.open(SCREENSHOT_DIR / case["screenshot"]).convert("RGBA")
        screenshot.thumbnail((thumb_width - 16, thumb_height - 12), Image.Resampling.LANCZOS)
        x = (index % columns) * thumb_width + (thumb_width - screenshot.width) // 2
        y = 42 + (index // columns) * (thumb_height + label_height)
        sheet.paste(screenshot, (x, y), screenshot)
        label = f"{case['caseId']} {case['name']}\n{case['result']} / issues {len(case['issues'])}"
        draw.multiline_text(
            ((index % columns) * thumb_width + 8, y + thumb_height),
            label,
            fill="#303844",
            spacing=2,
            font=ImageFont.load_default(),
        )
    sheet.save(CONTACT_DIR / output_name)


def write_report(manifest: dict[str, Any]) -> None:
    cases = manifest["cases"]
    issues = [
        (case, issue)
        for case in cases
        for issue in case["issues"]
    ]
    severity_counts = {
        severity: sum(
            1 for _, issue in issues if issue["severity"] == severity
        )
        for severity in ("BLOCKER", "MAJOR", "MINOR")
    }
    pass_count = sum(case["result"] == "PASS" for case in cases)
    failed_count = len(cases) - pass_count
    lines = [
        "# 방꾸미기 Visual QA 보고서",
        "",
        "## 테스트 환경",
        "",
        "- 방식: 프로덕션 Room 배치 공식을 재현한 결정적 Pillow 렌더러",
        "- 원본 레이아웃: `src/pages/room.tsx`",
        "- 슬롯/아이템 정의: `src/constants/room-definitions.ts`",
        "- 에셋 매핑: `scripts/embed-room-assets.cjs`",
        "- 디자인 기준: 768×1024",
        "- 테스트 Room Container 너비: 360px, 390px, 430px",
        "- 랜덤 위치·포즈·날짜·포인트 변화 없음",
        "- 제한: 앱인토스 호스트 내비게이션/Safe Area와 React Native 자체 래스터라이저는 포함하지 않음",
        "",
        "## 요약",
        "",
        f"- 테스트한 Room Asset: {manifest['assetCount']}개",
        f"- 테스트한 Slot: {manifest['slotCount']}개",
        f"- 생성한 스크린샷: {manifest['screenshotCount']}장",
        f"- PASS: {pass_count}개 Case",
        f"- FAIL: {failed_count}개 Case",
        f"- BLOCKER: {severity_counts['BLOCKER']}건",
        f"- MAJOR: {severity_counts['MAJOR']}건",
        f"- MINOR: {severity_counts['MINOR']}건",
        "",
        "## Item별 오류 목록",
        "",
    ]
    for case, issue in issues:
        measurement = next(
            (
                value
                for value in case["measurements"]
                if value["itemId"] == issue["itemId"]
                and value["slotId"] == issue.get("slotId")
            ),
            None,
        )
        lines.extend(
            [
                f"### {case['caseId']} · {issue['itemId']} · {issue['severity']}",
                "",
                f"- 스크린샷: `screenshots/{case['screenshot']}`",
                f"- Asset: `{issue.get('assetFile', measurement['assetId'] if measurement else 'N/A')}`",
                f"- Slot: `{issue.get('slotId', 'N/A')}`",
            ]
        )
        if measurement:
            lines.extend(
                [
                    f"- 현재 x/y: {measurement['x']} / {measurement['y']}px (viewport {case['viewportWidth']}px)",
                    f"- 현재 width/height: {measurement['width']} / {measurement['height']}px",
                    f"- 현재 zIndex: {measurement['zIndex']}",
                    f"- 현재 renderOffsetX/Y: {measurement['renderOffsetX']} / {measurement['renderOffsetY']}",
                ]
            )
        lines.extend(
            [
                f"- 문제: {issue['description']}",
                f"- 기대 결과: {issue['expected']}",
                f"- 권장 방향: {issue['recommendation']}",
                "",
            ]
        )

    slot_summary: dict[str, dict[str, int]] = {}
    for _, issue in issues:
        slot_id = issue.get("slotId", "N/A")
        slot_summary.setdefault(slot_id, {"BLOCKER": 0, "MAJOR": 0, "MINOR": 0})
        slot_summary[slot_id][issue["severity"]] += 1
    lines.extend(["## Slot별 오류 목록", ""])
    for slot_id, counts in slot_summary.items():
        lines.append(
            f"- `{slot_id}`: BLOCKER {counts['BLOCKER']}, MAJOR {counts['MAJOR']}, MINOR {counts['MINOR']}"
        )

    lines.extend(
        [
            "",
            "## 가장 먼저 고칠 문제 5개",
            "",
            "1. `PET_SLOT_2`를 방 안쪽으로 이동해 기본/갈색 강아지가 바닥 경계 밖으로 나가는 문제 해결",
            "2. `plant-olive`와 `plant-fiddle`에 서로 다른 고유 Asset 연결",
            "3. `plant-succulent`의 선반 슬롯 가시 크기 확대 또는 선반 전용 Asset 적용",
            "4. `APPLIANCE_SLOT`을 왼쪽으로 소폭 이동해 책장과 바닥 외곽 여백 확보",
            "5. `PET_SLOT`을 오른쪽으로 미세 조정해 고양이 발·꼬리 주변 여백 확보",
            "",
            "## 스크린샷 및 Contact Sheet",
            "",
            "- 전체 스크린샷: `screenshots/`",
            "- 카테고리별 Contact Sheet: `contact-sheets/`",
            "- 관계·Stress·반응형: `contact-sheets/combinations-contact-sheet.png`",
            "- Test Manifest: `manifest.json`",
            "- 수동 판정 원본: `review-findings.json`",
            "",
            "## 수정 권장 순서",
            "",
            "1. 동물 슬롯 경계 문제",
            "2. 중복 식물 Asset",
            "3. 선반용 다육이 가시 크기",
            "4. 책장 외곽 여백",
            "5. 수정 후 동일 Manifest로 360/390/430px 회귀 캡처",
            "",
            "## 판정 유의사항",
            "",
            "이번 단계에서는 앱 코드, 좌표, 크기, Asset, zIndex를 변경하지 않았습니다. "
            "보고된 권장값은 다음 수정 단계의 검토안이며 자동 적용되지 않았습니다.",
        ]
    )
    (OUTPUT_ROOT / "report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    CONTACT_DIR.mkdir(parents=True, exist_ok=True)
    slots, items = load_definitions()
    asset_map = load_asset_map()
    cases = build_cases(slots, items)
    review_findings = (
        json.loads(REVIEW_PATH.read_text(encoding="utf-8"))
        if REVIEW_PATH.exists()
        else {}
    )

    for case in cases:
        scene, measurements = render_scene(
            slots,
            items,
            asset_map,
            case["placements"],
            case["viewportWidth"],
        )
        filename = safe_filename(case)
        scene.save(SCREENSHOT_DIR / filename)
        case["screenshot"] = filename
        case["items"] = [
            {"itemId": item_id, "slotId": slot_id}
            for slot_id, item_id in case["placements"].items()
        ]
        case["measurements"] = measurements
        auto_issues = [
            {
                "severity": "BLOCKER",
                "itemId": measurement["itemId"],
                "description": "visible alpha bounds are clipped by the room container",
            }
            for measurement in measurements
            if measurement["clipped"]
        ]
        case["issues"] = [*auto_issues, *review_findings.get(case["caseId"], [])]
        case["result"] = "FAIL" if case["issues"] else "PASS"
        del case["placements"]

    manifest = {
        "environment": {
            "renderer": "Pillow deterministic scene renderer",
            "sourceLayout": "src/pages/room.tsx",
            "sourceDefinitions": "src/constants/room-definitions.ts",
            "sourceAssets": "scripts/embed-room-assets.cjs",
            "designSize": [DESIGN_WIDTH, DESIGN_HEIGHT],
            "viewportWidths": list(VIEWPORT_WIDTHS),
            "limitations": [
                "Does not include Apps in Toss host navigation or safe-area chrome",
                "Uses the production Room scene layout formula but not React Native rasterization",
            ],
        },
        "assetCount": len(items),
        "slotCount": len(slots),
        "screenshotCount": len(cases),
        "cases": cases,
    }
    (OUTPUT_ROOT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    write_report(manifest)

    categories: dict[str, list[dict[str, Any]]] = {}
    for case in cases:
        if case["name"].startswith("SINGLE_"):
            item_id = case["items"][0]["itemId"]
            categories.setdefault(items[item_id].category, []).append(case)
    for category, category_cases in categories.items():
        make_contact_sheet(
            category_cases,
            f"{category} single-item QA",
            f"{category.lower()}-contact-sheet.png",
        )
    make_contact_sheet(
        [case for case in cases if case["caseId"] >= "CASE_101"],
        "Room relation, stress, and responsive QA",
        "combinations-contact-sheet.png",
        columns=3,
    )
    print(
        json.dumps(
            {
                "assets": len(items),
                "slots": len(slots),
                "screenshots": len(cases),
                "output": str(OUTPUT_ROOT),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
