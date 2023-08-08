<template>
    <div style="width:100%">
        <div>
            <img src="../../../public/static/png/top.png">
        </div>
        <div style="display: flex;justify-content: center;margin-top: 32px;">
            <div class="btn-icon" v-for="(item, index) in 4" :key="index">
                <img src="../../../public/static/png/数字库区.png">
                <div class="text-yellow">数字库区</div>
            </div>
        </div>
    </div>
    <div>
        <div style="display: flex; justify-content: center;margin-top: 240px;">
            <div v-for="(item, index) in 4" :key="index" class="search-icon">
                <img src="../../../public/static/png/搜索按钮.png">
                <div>月台</div>
            </div>
        </div>
    </div>
</template>
<script>
export default ({
    setup() {

    },
})
</script>
<style scoped lang="less">
* {
    background-color: black;
}

.btn-icon {
    width: 140px;
    height: 46px;
    margin-left: 40px;
    position: relative;
}

.position-common(@top, @left, @marginleft) {
    position: @position;
    top: @top;
    left: @left;
    margin-left: @marginleft;
}

.text-yellow {
    position: absolute;
    top: 10px;
    left: 60px;
    font-size: 18px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #FFFFFF;
    -webkit-background-clip: text;
    /* -webkit-text-fill-color: transparent; */
}
.search-icon{
}
</style>