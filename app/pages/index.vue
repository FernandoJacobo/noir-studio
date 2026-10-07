<script setup lang="ts">
const { brand } = useAppConfig()

useSeoMeta({
  title: '',
  description: brand.description,
})
</script>

<template>
  <div>
    <LandingHero />
    <LandingServices />
    <SharedDefer id="equipo" min-height="900px">
      <LazyLandingTeam />
    </SharedDefer>
    <SharedDefer id="opiniones" min-height="560px">
      <LazyLandingTestimonials />
    </SharedDefer>
    <SharedDefer id="ubicacion" min-height="640px">
      <LazyLandingLocation />
    </SharedDefer>
  </div>
</template>
