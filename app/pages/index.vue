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
    <LandingTeam />
    <LandingTestimonials />
    <LandingLocation />
  </div>
</template>
