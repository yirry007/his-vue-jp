<template>
    <div class="customer-container">
        <el-menu :default-active="active" class="menu" @select="selectHandle">
            <el-menu-item index="FrontMine">
                <el-icon>
                    <User />
                </el-icon>
                <span>アカウント情報</span>
            </el-menu-item>
            <el-menu-item index="FrontOrderList">
                <el-icon>
                    <Tickets />
                </el-icon>
                <span>注文履歴</span>
            </el-menu-item>
            <el-menu-item index="FrontAppointmentList">
                <el-icon>
                    <Files />
                </el-icon>
                <span>健診予約</span>
            </el-menu-item>
            <el-menu-item index="FrontCustomerIm">
                <el-icon>
                    <Collection />
                </el-icon>
                <span>カスタマーサポート</span>
            </el-menu-item>
        </el-menu>
        <div class="content"><router-view /></div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, type Ref, getCurrentInstance } from 'vue';
import router from '../../router/index';
const instance = getCurrentInstance();
const proxy = instance?.proxy; // 安全访问 proxy

//如果直接通过URL地址加载某个Vue页面，customer框架页面的菜单应该选中相关的选项
let name = router.currentRoute.value.name;
let active = ref(name);

function selectHandle(index) {
    active = ref(index);
    router.push({ name: index });
}
</script>

<style lang="less" scoped>
@import url('customer.less');
</style>