<script>
  export let item = {};

  import { fly } from "svelte/transition";

  import { Button } from "smelte";
  import { Checkbox } from "smelte";
  import { allParams,removeItem, updateItem } from "./Database.svelte";
  import { onDestroy } from 'svelte';

  const swipeDelay = 250; // ms
  const swipeMargin = 25; // px
  const deleteButtonVisibility = 5000; // ms

  var visible = true;
  var deleteVisible = false;
  var timerHandleTouch = null;
  var timerHandleDelete = null;

  var startPos = { x:-1, y:-1 };
  var currentPos = { x:-1, y:-1 };
  var inSwipe = false;

    var pointerEventToXY = function(e){
      var out = {x:0, y:0};
      if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
        var touch = e.touches[0] || e.changedTouches[0];
        out.x = touch.pageX;
        out.y = touch.pageY;
      } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
        out.x = e.pageX;
        out.y = e.pageY;
      }
      return out;
    };

  function startTouch(evt) {
    // no swipe detection if delete button is already visible
    if (deleteVisible || $allParams.allwaysShowDeleteButton) return;

    inSwipe = false;

    // store start position
    startPos = pointerEventToXY(evt);
    currentPos = startPos;

    timerHandleTouch = setTimeout(() => {
      timerHandleTouch = null;
      // let's evaluate after a certain time
      if (currentPos.x == -1) {
        // no move, no swipe, nothing to do
      } else {
        if (Math.abs(currentPos.y - startPos.y) <= swipeMargin) {
          // Check if we are not alrady scrolling

          if (Math.abs(currentPos.x - startPos.x) > swipeMargin) {
            // swipe in progress
            inSwipe = true;
            if (evt.cancelable) evt.preventDefault();
            deleteVisible = true;
            timerHandleDelete = setTimeout(() => {
              timerHandleDelete = false;
              deleteVisible = false;
            },deleteButtonVisibility);
          }
        }
      }
     },swipeDelay);
  }

  function moveTouch(evt) {
    // store current position
    currentPos = pointerEventToXY(evt);
  }

function stopTouch(evt) {
    if (deleteVisible || $allParams.allwaysShowDeleteButton) return;
    
    if (timerHandleTouch != null) {
      // Stop the timer, it was not a swipe
      clearTimeout(timerHandleTouch);
      timerHandleTouch = null;
    } else if (inSwipe) {
      inSwipe = false;
      if (evt.cancelable) evt.preventDefault();
    }
  }

  onDestroy( () => {
    // Clear any timer
    if (timerHandleTouch != null) clearTimeout(timerHandleTouch);
    if (timerHandleDelete != null) clearTimeout(timerHandleDelete);
  });

  function deleteItem() {
    visible = false;
    setTimeout(() => removeItem(item), 400);
  }

  function saveItem() {
    item.coche = !item.coche;
    updateItem(item);
  }

</script>

{#if visible}
  <div class="flex" transition:fly={{ x: -200, duration: 400 }} on:mousedown={startTouch} on:mousemove={moveTouch} on:mouseup={stopTouch} on:mouseleave={stopTouch} on:touchstart={startTouch} on:touchmove={moveTouch} on:touchend={stopTouch} on:touchcancel={stopTouch}>
    <li class="flex-grow">
      <div class="flex">
        {#if deleteVisible || $allParams.allwaysShowDeleteButton}
        <div class="w-2/12 items-center"  transition:fly={{ x: -200, duration: 400 }}>
          <Button
            add="align-middle mt-1"
            color = "error"
            small
            flat
            light
            icon="delete_outline"
            on:click={deleteItem} />
        </div>
        {/if}
        <div class="w-11/12" transition:fly={{ x: -200, duration: 400 }}>
          {#if item.coche}
            <Checkbox
              labelClasses="line-through"
              label={item.produit}
              checked={item.coche}
              on:change={saveItem} />
          {:else}
            <Checkbox
              label={item.produit}
              checked={item.coche}
              on:change={saveItem} />
          {/if}
        </div>
      </div>
      <hr />
    </li>
  </div>
{/if}
