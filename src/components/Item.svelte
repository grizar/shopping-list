<script>
  import { allParams, removeItem, updateItem } from "./Database.js";

  export let item = {};

  // import { fly } from "svelte/transition";
  // transition:fly={{ x: -200, duration: 400 }}

  import { Button } from "smelte";
  import { Checkbox } from "smelte";
  import { onMount, onDestroy } from "svelte";
  import { push } from 'svelte-spa-router';

  const swipeDelay = 250; // ms
  const swipeMargin = 25; // px
  const deleteButtonVisibility = 5000; // ms
  const longPressDelay = 1250; // ms

  var deleteVisible = false;
  var timerHandleTouch = null;
  var timerHandleDelete = null;
  var timerHandleLongPress = null;

  var startPos = { x: -1, y: -1 };
  var currentPos = { x: -1, y: -1 };
  var inSwipe = false;
  var inScroll = false;

  var pointerEventToXY = function(e) {
    var out = { x: 0, y: 0 };
    if (
      e.type == "touchstart" ||
      e.type == "touchmove" ||
      e.type == "touchend" ||
      e.type == "touchcancel"
    ) {
      var touch = e.touches[0] || e.changedTouches[0];
      out.x = touch.pageX;
      out.y = touch.pageY;
    } else if (
      e.type == "mousedown" ||
      e.type == "mouseup" ||
      e.type == "mousemove" ||
      e.type == "mouseover" ||
      e.type == "mouseout" ||
      e.type == "mouseenter" ||
      e.type == "mouseleave"
    ) {
      out.x = e.pageX;
      out.y = e.pageY;
    }
    return out;
  };

  function startTouch(evt) {
    // no swipe detection if delete button is already visible
    if (deleteVisible || $allParams.allwaysShowDeleteButton) return;

    inSwipe = false;
    inScroll = false;

    // store start position
    startPos = pointerEventToXY(evt);
    currentPos = startPos;

    timerHandleTouch = setTimeout(() => {
      timerHandleTouch = null;
      // let's evaluate after a certain time
      if (currentPos.x == -1) {
        // no move, no swipe, nothing to do
      } else {
        if (Math.abs(currentPos.y - startPos.y) > swipeMargin) {
          // We are scrolling, we cancel the long press detection
          isScroll = true;
          clearTimeout(timerHandleLongPress);
          timerHandleLongPress = null;
        } else {
          // So, we are not scrolling, check if we are swipping
          if (Math.abs(currentPos.x - startPos.x) > swipeMargin) {
            // swipe in progress, we cancel the long press detection
            inSwipe = true;
            clearTimeout(timerHandleLongPress);
            timerHandleLongPress = null;
            if (evt.cancelable) evt.preventDefault();
            deleteVisible = true;
            timerHandleDelete = setTimeout(() => {
              timerHandleDelete = false;
              deleteVisible = false;
            }, deleteButtonVisibility);
          }
        }
      }
    }, swipeDelay);

    timerHandleLongPress = setTimeout( () => {
      timerHandleLongPress = null;
      editItem();
    },longPressDelay);
  }

  function moveTouch(evt) {
    // store current position
    currentPos = pointerEventToXY(evt);
  }

  function stopTouch(evt) {
    if (deleteVisible || $allParams.allwaysShowDeleteButton) return;

    if (timerHandleLongPress != null) {
      clearTimeout(timerHandleLongPress);
      timerHandleLongPress = null;
    }
    if (timerHandleTouch != null) {
      // Stop the timer, it was not a swipe
      clearTimeout(timerHandleTouch);
      timerHandleTouch = null;
    } else if (inSwipe) {
      inSwipe = false;
      if (evt.cancelable) evt.preventDefault();
    }
  }

  onDestroy(() => {
    // Clear any timer
    if (timerHandleTouch != null) clearTimeout(timerHandleTouch);
    if (timerHandleDelete != null) clearTimeout(timerHandleDelete);
    if (timerHandleLongPress != null) clearTimeout(timerHandleLongPress);
  });

  function deleteItem() {
    removeItem(item);
  }

  function toggleItem() {
    item.coche = !item.coche;
    updateItem(item);
  }

  function editItem() {
    var editLink = "#/item/edit/" + item._id;
    push(editLink);
  }

  function clickItem() {
    if ($allParams.longPressToEdit) {
      toggleItem();
    } else {
      editItem();
    }
  }

</script>

<div
  class="flex"
  
  on:mousedown={startTouch}
  on:mousemove={moveTouch}
  on:mouseup={stopTouch}
  on:mouseleave={stopTouch}
  on:touchstart={startTouch}
  on:touchmove={moveTouch}
  on:touchend={stopTouch}
  on:touchcancel={stopTouch}>
  <li class="flex-grow">
    <div class="flex">
      {#if deleteVisible || $allParams.allwaysShowDeleteButton}
        <div
          class="w-2/12 items-center" >
          
          <Button
            add="align-middle mt-1"
            color="error"
            small
            flat
            light
            icon="delete_outline"
            on:click={deleteItem} />
        </div>
      {/if}
      <div class="flex w-11/12" >
        <Checkbox checked={item.coche} on:change={toggleItem} />
        {#if item.coche}
          <span class="line-through mb-2 self-center" on:click={clickItem}>{item.produit}</span>
        {:else}
          <span class="mb-2 self-center" on:click={clickItem}>{item.produit}</span>
        {/if}
      </div>
    </div>
    <hr />
  </li>
</div>