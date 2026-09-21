<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * 路线站点可视化打点编辑器。
 *
 * 运营侧此前只能手工敲经纬度数字（RouteEdit 的纬度/经度输入框），看不到地图、
 * 无法拖拽打点，也无法核对某站点是否落在正确位置。本组件把同一批 route_stops
 * 坐标渲染成可拖拽的编号点位：拖拽或点选地图即回写经纬度，编号与站点顺序一致。
 *
 * 底图沿用公开站点已在生产使用的 CARTO 栅格瓦片（与 site 的 MapLibre 底图同源）。
 * 瓦片地址可用 VITE_MAP_TILE_URL / VITE_MAP_TILE_ATTRIBUTION 覆盖，便于切换到
 * 国内可达的瓦片源而无需改代码。
 */

type MapStop = {
  id?: string;
  stopName?: string;
  lat?: number | null;
  lng?: number | null;
};

const props = withDefaults(
  defineProps<{
    stops: MapStop[];
    activeIndex: number;
    height?: number;
    readonly?: boolean;
  }>(),
  { height: 320, readonly: false },
);

const emit = defineEmits<{
  (event: "select", index: number): void;
  (
    event: "update:coordinates",
    payload: { index: number; lat: number; lng: number },
  ): void;
}>();

const DEFAULT_TILE_URL =
  "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// 广东大致中心，用于没有任何坐标时的初始视野。
const FALLBACK_CENTER: L.LatLngTuple = [23.13, 113.26];
const FALLBACK_ZOOM = 8;

const container = ref<HTMLDivElement | null>(null);
const tilesFailed = ref(false);
const ready = ref(false);

let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;
let resizeObserver: ResizeObserver | null = null;
let tileErrorCount = 0;

const points = computed(() =>
  props.stops
    .map((stop, index) => ({ stop, index }))
    .filter(({ stop }) => isFiniteCoordinate(stop.lat) && isFiniteCoordinate(stop.lng)),
);

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function round6(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

function markerLabel(index: number) {
  return `${index + 1}`;
}

function markerIcon(index: number, active: boolean) {
  return L.divIcon({
    className: "route-stop-pin-wrapper",
    html: `<span class="route-stop-pin${active ? " is-active" : ""}">${markerLabel(index)}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function stopTitle(stop: MapStop, index: number) {
  const name = (stop.stopName || "").trim();
  return name ? `${index + 1}. ${name}` : `站点 ${index + 1}`;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function buildMap() {
  if (!container.value || map) return;
  const reduced = prefersReducedMotion();
  map = L.map(container.value, {
    center: FALLBACK_CENTER,
    zoom: FALLBACK_ZOOM,
    zoomAnimation: !reduced,
    fadeAnimation: !reduced,
    markerZoomAnimation: !reduced,
    // 拖拽打点是本组件的核心动作，必须始终可用。
    dragging: !props.readonly,
    attributionControl: true,
  });

  tileLayer = L.tileLayer(
    (import.meta.env.VITE_MAP_TILE_URL as string | undefined) || DEFAULT_TILE_URL,
    {
      attribution:
        (import.meta.env.VITE_MAP_TILE_ATTRIBUTION as string | undefined) ||
        DEFAULT_ATTRIBUTION,
      maxZoom: 19,
      detectRetina: true,
    },
  );
  tileLayer.on("tileerror", () => {
    tileErrorCount += 1;
    // 零星瓦片失败属正常；只有大面积失败才提示，避免误报。
    if (tileErrorCount >= 6) tilesFailed.value = true;
  });
  tileLayer.addTo(map);

  map.on("click", (event: L.LeafletMouseEvent) => {
    if (props.readonly) return;
    if (props.activeIndex < 0 || props.activeIndex >= props.stops.length) return;
    emit("update:coordinates", {
      index: props.activeIndex,
      lat: round6(event.latlng.lat),
      lng: round6(event.latlng.lng),
    });
  });

  ready.value = true;
}

function markerTooltip(active: boolean) {
  return active ? { permanent: false, direction: "top" as const } : undefined;
}

/** 站点结构与坐标的签名：只在结构变化时重新布局，避免拖拽过程中被强制回中。 */
function renderMarkers(fit: boolean) {
  if (!map) return;
  const reduced = prefersReducedMotion();

  // 清掉旧标记，保留 tile 层。
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) map?.removeLayer(layer);
  });

  const bounds = L.latLngBounds([]);

  points.value.forEach(({ stop, index }) => {
    const active = index === props.activeIndex;
    const marker = L.marker([stop.lat as number, stop.lng as number], {
      icon: markerIcon(index, active),
      draggable: !props.readonly,
      keyboard: false,
      title: stopTitle(stop, index),
      zIndexOffset: active ? 1000 : 0,
    });
    marker.bindTooltip(stopTitle(stop, index), markerTooltip(active));

    marker.on("click", (event: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(event);
      emit("select", index);
    });

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      emit("select", index);
      emit("update:coordinates", {
        index,
        lat: round6(position.lat),
        lng: round6(position.lng),
      });
    });

    marker.addTo(map as L.Map);
    bounds.extend([stop.lat as number, stop.lng as number]);
  });

  if (fit && bounds.isValid()) {
    map.fitBounds(bounds.pad(0.25), {
      animate: !reduced,
      maxZoom: 13,
    });
  }
}

function focusActive() {
  if (!map) return;
  const active = points.value.find(({ index }) => index === props.activeIndex);
  if (!active) return;
  const position = L.latLng(active.stop.lat as number, active.stop.lng as number);
  if (!map.getBounds().contains(position)) {
    map.panTo(position, { animate: !prefersReducedMotion() });
  }
}

onMounted(async () => {
  await nextTick();
  buildMap();
  renderMarkers(true);

  if (container.value && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => map?.invalidateSize());
    resizeObserver.observe(container.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  tileLayer = null;
  map?.remove();
  map = null;
});

// 站点数量或 id 变化 → 重新布局并自适应视野。
watch(
  () => props.stops.map((stop) => stop.id ?? stop.stopName ?? "").join("|"),
  () => {
    renderMarkers(true);
  },
);

// 坐标变化（含拖拽回写、数字输入）→ 只重建标记，不动视野。
watch(
  () => props.stops.map((stop) => `${stop.lat ?? ""},${stop.lng ?? ""}`).join("|"),
  () => {
    renderMarkers(false);
  },
);

// 高亮切换与站点切换 → 更新样式并确保激活站点在视野内。
watch(
  () => props.activeIndex,
  () => {
    renderMarkers(false);
    focusActive();
  },
);
</script>

<template>
  <div class="route-stop-map">
    <div
      ref="container"
      class="route-stop-map__canvas"
      :style="{ height: `${height}px` }"
      role="application"
      aria-label="路线站点地图打点：拖拽编号点位或点选地图为该站点定位"
    />
    <p class="route-stop-map__hint">
      拖拽编号点位或点选地图，即可为当前站点写入经纬度；编号与左侧站点顺序一致。
    </p>
    <el-alert
      v-if="tilesFailed"
      type="warning"
      :closable="false"
      show-icon
      title="底图瓦片未能完整加载"
      description="可能是当前网络无法访问瓦片服务。点位仍可拖拽打点，也可继续用纬度和经度输入框精确录入。"
    />
    <p v-if="!ready" class="route-stop-map__loading">地图组件加载中…</p>
  </div>
</template>

<style scoped>
.route-stop-map {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-stop-map__canvas {
  width: 100%;
  min-height: 200px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}

.route-stop-map__hint,
.route-stop-map__loading {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

/* divIcon 使用自绘编号，避免 Leaflet 默认图标在打包后丢图。 */
:deep(.route-stop-pin-wrapper) {
  background: transparent;
  border: 0;
}

:deep(.route-stop-pin) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid var(--el-color-primary);
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  cursor: grab;
  box-shadow: 0 1px 4px rgb(0 0 0 / 24%);
}

:deep(.route-stop-pin.is-active) {
  background: var(--el-color-primary);
  color: #ffffff;
  transform: scale(1.15);
}

:deep(.route-stop-pin:active) {
  cursor: grabbing;
}
</style>