<script>
  import {
    parameters,
    local,
    database
  } from "./state.js";
  export let item = {};
  export let type = "";

  // import { fly } from "svelte/transition";
  // transition:fly={{ x: -200, duration: 400 }}

  import { Button } from "smelte";
  import { Checkbox } from "smelte";
  import { onMount, onDestroy } from "svelte";
  import { push } from "svelte-spa-router";

  const swipeDelay = 250; // ms
  const scrollMargin = 10; // px
  const deleteButtonVisibility = 5000; // ms
  const longPressDelay = 1250; // ms
  const ratioScrollSwipe = 0.75; // Ratio between Scroll and Swipe
  const noMoveMargin = 5; // px

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
    if (deleteVisible || $parameters.allwaysShowDeleteButton) return;

    inSwipe = false;
    inScroll = false;

    // store start position
    startPos = pointerEventToXY(evt);
    // currentPos = startPos;
    currentPos = { x: -1, y: -1 };

    timerHandleTouch = setTimeout(() => {
      timerHandleTouch = null;
      // let's evaluate after a certain time
      if (currentPos.x == -1) {
        // no move, no swipe, nothing to do
      } else {
        var deltaX = Math.abs(currentPos.x - startPos.x);
        var deltaY = Math.abs(currentPos.y - startPos.y);
        if (deltaX > noMoveMargin || deltaY > noMoveMargin) {
          if (deltaX == 0 || deltaY / deltaX > ratioScrollSwipe) {
            inScroll = true;
            clearTimeout(timerHandleLongPress);
            timerHandleLongPress = null;
          } else {
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

    if ($parameters.longPressToEdit) {
      // Setting the timer function only if long press to edit is on
      timerHandleLongPress = setTimeout(() => {
        timerHandleLongPress = null;
        // Only edit item if we didn't start a scroll
        if (
          currentPos.y == -1 ||
          Math.abs(currentPos.y - startPos.y) <= scrollMargin
        ) {
          if (evt.cancelable) evt.preventDefault();
          editItem();
        }
      }, longPressDelay);
    }
  }

  function moveTouch(evt) {
    // store current position
    currentPos = pointerEventToXY(evt);
  }

  function stopTouch(evt) {
    if (deleteVisible || $parameters.allwaysShowDeleteButton) return;

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
    if (type == "item") {
      database.removeItem(item);
    } else {
      database.removeCategory(item);
    }
  }

  function toggleItem() {
    if (type == "item") {
      item.coche = !item.coche;
      database.updateItem(item);
    }
  }

  function editItem() {
    var editLink = "";
    editLink = type == "item" ? "#/item/edit/" : "#/category/edit/";
    editLink += item._id;
    push(editLink);
  }

  function clickItem() {
    if ($parameters.longPressToEdit) {
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
      {#if deleteVisible || $parameters.allwaysShowDeleteButton}
        <Button
          add="flex-none align-middle mr-3 mt-1"
          color="error"
          small
          flat
          light
          icon="delete_outline"
          on:click={deleteItem} />
      {/if}
      {#if type == 'item'}
        <Checkbox checked={item.coche} on:change={toggleItem} />
        {#if item.coche}
          <span class="line-through mb-2 self-center" on:click={clickItem}>
            {item.produit}
          </span>
        {:else}
          <span class="mb-2 self-center" on:click={clickItem}>
            {item.produit}
          </span>
        {/if}
      {:else}
        <span class="mt-2 h-8 self-center" on:click={clickItem}>
          {item.category}
        </span>
      {/if}
    </div>
    <hr />
  </li>
</div>
