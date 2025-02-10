<template>
    <div class="home-TUIKit-main">
        <div class="conversation">
            <!-- <TUISearch class="TUIKit-search" /> -->
            <TUIConversation />
        </div>
        <div class="TUIKit-chat">
            <TUIChat />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, type Ref, getCurrentInstance, toRefs } from 'vue';
import { TUISearch, TUIConversation, TUIChat } from '../../TUIKit';
import { TUILogin } from '@tencentcloud/tui-core';
import { framework } from '../../TUIKit/adapter-vue';

const instance = getCurrentInstance();
const proxy = instance?.proxy; // 安全访问 proxy

proxy.$http("/front/customer/im/createAccount", "GET", null, true, function (resp) {
    let result = resp.result
    let account = result.account;
    let sdkAppId = result.sdkAppId
    let userSig = result.userSig
    //登陆客户IM账号
    TUILogin.login({
        SDKAppID: 1600069978,
        userID: account,
        userSig: userSig,
        useUploadPlugin: true,
        framework,
    })
})
</script>

<style lang="less">
@import url("customer_im.less");
</style>
