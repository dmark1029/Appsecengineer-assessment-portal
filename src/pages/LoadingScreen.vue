<template>
  <section class="bg-loading window-height">
    <q-card class="absolute-center bg-loading flex flex-center" flat style="width: 30vw; height: 50vh">
      <q-img :ratio="242 / 76" src="logo.svg" />
      <div class="loading">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </q-card>
  </section>
</template>

<style scoped lang="scss">
.bg-loading {
  background: #131365;
}
.loading {
  $colors: #7ef9ff, #89cff0, #4682b4, #0f52ba, #000080;
  display: flex;
  font-size: 22px;

  .dot {
    border-radius: 50%;
    height: 2em;
    margin: 0.8em;
    position: relative;
    width: 2em;

    &::before {
      animation: wave 2s ease-out infinite;
      background: inherit;
      border-radius: inherit;
      content: '';
      height: 100%;
      position: absolute;
      width: 100%;
    }

    @for $i from 1 through 5 {
      &:nth-child(#{$i}) {
        background: nth($colors, $i);

        &::before {
          animation-delay: $i * 0.2s;
        }
      }
    }
  }
}

@keyframes wave {
  50%,
  75% {
    transform: scale(2.5);
  }

  80%,
  100% {
    opacity: 0;
  }
}
.bg_color {
  background-image: radial-gradient(circle, #f5f5fc 20%, #ffffff 100%);
}
</style>
