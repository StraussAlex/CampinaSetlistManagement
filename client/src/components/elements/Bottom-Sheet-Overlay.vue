<script setup lang="ts">
import { ref, onMounted } from "vue";
import "../../stylesheets/bottom-sheet-overlay.css";

const bottomSheet = ref<HTMLDivElement | null>(null);
const sheetOverlay = ref<HTMLDivElement | null>(null);
const sheetContent = ref<HTMLDivElement | null>(null);
const dragIcon = ref<HTMLDivElement | null>(null);

let isDragging = false;
let startY = 0;
let startHeight = 0;

const updateSheetHeight = (raw: number) => {
  if (!sheetContent.value || !bottomSheet.value || !sheetOverlay.value) return;

  const height = Math.min(Math.max(raw, 0), 100);

  bottomSheet.value.style.height  = `${height}vh`;
  sheetContent.value.style.height = `${height}vh`;

  if (isDragging) return;

  const isFull = height >= 100 - 0.01;
  bottomSheet.value.classList.toggle("fullscreen", isFull);

  if (height > 10 && !isFull) {
    sheetOverlay.value.style.pointerEvents = "auto";
    sheetOverlay.value.style.background = "rgba(0,0,0,0.5)";
  } else {
    sheetOverlay.value.style.pointerEvents = "none";
    sheetOverlay.value.style.background = "transparent";
  }
};

const showBottomSheet = () => {
  if (!bottomSheet.value || !sheetOverlay.value) return;
  bottomSheet.value.classList.add("show");
  document.body.style.overflowY = "auto";
  updateSheetHeight(2);
};

const setupBottomSheet = () => {
  if (!bottomSheet.value || !sheetOverlay.value) return;

  bottomSheet.value.classList.add("show", "no-transition");
  document.body.style.overflowY = "auto";

  updateSheetHeight(2);

  requestAnimationFrame(() => {
    if (!bottomSheet.value) return;
    bottomSheet.value.classList.remove("no-transition");
  });
};

const hideBottomSheet = () => {
  if (!bottomSheet.value || !sheetOverlay.value || !sheetContent.value) return;
  bottomSheet.value.classList.remove("fullscreen", "dragging");
  document.body.style.overflowY = "auto";
  sheetOverlay.value.style.background = "transparent";
  updateSheetHeight(5);
};

const dragStart = (e: MouseEvent | TouchEvent) => {
  if (!sheetContent.value || !bottomSheet.value) return;
  bottomSheet.value.classList.add("dragging");
  isDragging = true;
  startY = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY;
  startHeight = parseInt(sheetContent.value.style.height || "50");
  
};

const dragging = (e: MouseEvent | TouchEvent) => {
  if (!isDragging || !sheetContent.value) return;

  const currentY = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY;
  const delta = startY - currentY;
  const newHeight = startHeight + (delta / window.innerHeight) * 100;
  updateSheetHeight(newHeight);
};

const dragStop = () => {
  if (!sheetContent.value || !bottomSheet.value) return;
  isDragging = false;
  bottomSheet.value.classList.remove("dragging");

  const h = parseFloat(sheetContent.value.style.height) || 0;

  if (h < 30) {
    hideBottomSheet();
  } else if (h < 45) {
    updateSheetHeight(40);
   } else if (h < 80) {
    updateSheetHeight(75);
  } else {
    updateSheetHeight(100);
    if (!sheetOverlay.value) return;
    sheetOverlay.value.style.background = "rgba(0,0,0,0.5)";
  }
};

const openBottomSheetWithBtn = (num: Number) => {
  updateSheetHeight(num);
}

onMounted(() => {
  dragIcon.value?.addEventListener("mousedown", dragStart);
  window.addEventListener("mousemove", dragging);
  window.addEventListener("mouseup", dragStop);

  dragIcon.value?.addEventListener("touchstart", dragStart);
  window.addEventListener("touchmove", dragging);
  window.addEventListener("touchend", dragStop);
});

defineExpose({
  setupBottomSheet,
  openBottomSheetWithBtn,
  hideBottomSheet
})
</script>


<template>
  <div>
    <div ref="bottomSheet" class="bottom-sheet">
      <div ref="sheetOverlay" class="sheet-overlay" @click="hideBottomSheet"></div>

      <div ref="sheetContent" class="content">
        <div class="header">
          <div ref="dragIcon" class="drag-icon"><span></span></div>
        </div>

        <div class="body">
          <h2>Bottom Sheet Modal</h2>
          <p>
            Create a bottom sheet modal that functions similarly to Facebook modal using HTML CSS and JavaScript.
            This modal allows user to view its contents, drag it up or down, and close it. It also works on
            touch-enabled devices.
          </p>
          <p>Lorem Ipsum are simply dummy text...</p>
          <button></button>
        </div>
      </div>
    </div>
  </div>
</template>



