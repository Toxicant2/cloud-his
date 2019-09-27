<template>
    <section class="app-main">
        <keep-alive>
            <router-view v-if="$route.name === 'outpatientDetail'" />
        </keep-alive>
        <router-view v-if="$route.name !== 'outpatientDetail'" />
        <!--<transition name="fade" mode="out-in">
             <keep-alive>
          <router-view></router-view>
        </keep-alive>
            <router-view />
        </transition>-->
    </section>
</template>

<script>
export default {
    name: 'AppMain'
}
</script>

<style scoped>
.app-main {
  /*84 = navbar + tags-view = 50 +34 */
  min-height: calc(100vh - 84px);
  position: relative;
  overflow: hidden;
}
</style>
