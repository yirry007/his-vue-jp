<template>
    <div class="site-wrapper" :class="{ 'site-sidebar--fold': sidebar.sidebarFold }" v-loading.fullscreen.lock="loading"
        element-loading-text="拼命加载中">
        <nav class="site-navbar" :class="{ 'site-navbar--fold': sidebar.sidebarFold }">
            <div class="site-navbar__header">
                <h1 class="site-navbar__brand">
                    <a class="site-navbar__brand-lg">神州大健康体检系统</a>
                    <a class="site-navbar__brand-mini">体检</a>
                </h1>
            </div>
            <div class="navbar-container" :class="{ 'navbar-container--fold': sidebar.sidebarFold }">
                <div class="switch" @click="handleSwitch">
                    <SvgIcon name="zhedie" class="icon-svg" />
                </div>
                <div class="right-container">
                    <el-dropdown>
                        <span class="el-dropdown-link">
                            <span class="avatar-container">
                                <el-avatar shape="circle" :size="25" :src="user.photo" :icon="UserFilled"></el-avatar>
                            </span>
                            {{ user.name }}
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="updatePassword()">パスワードの変更</el-dropdown-item>
                                <el-dropdown-item @click="logout">ログアウト</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </nav>
        <aside class="site-sidebar site-sidebar--dark">
            <div class="site-sidebar__inner">
                <el-menu :default-active="siteContent.menuActiveName || 'Home'" :collapse="sidebar.sidebarFold"
                    :collapseTransition="false" class="site-sidebar__menu" background-color="#263238"
                    active-text-color="#fff" text-color="#8a979e">
                    <el-menu-item index="Home" @click="$router.push({ name: 'MisHome' })">
                        <el-icon>
                            <SvgIcon name="home" class="icon-svg" />
                        </el-icon>
                        <span slot="title">ホーム</span>
                    </el-menu-item>
                    <el-sub-menu index="組織管理" :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'">
                        <template #title>
                            <el-icon>
                                <SvgIcon name="users_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">組織管理</span>
                        </template>
                        <el-menu-item index="MisDept" v-if="proxy.isAuth(['ROOT', 'DEPT:SELECT'])"
                            @click="$router.push({ name: 'MisDept' })">
                            <el-icon>
                                <SvgIcon name="company_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">部門管理</span>
                        </el-menu-item>
                        <el-menu-item index="MisRole" v-if="proxy.isAuth(['ROOT', 'ROLE:SELECT'])"
                            @click="$router.push({ name: 'MisRole' })">
                            <el-icon>
                                <SvgIcon name="role_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">役割管理</span>
                        </el-menu-item>
                        <el-menu-item index="MisUser" v-if="proxy.isAuth(['ROOT', 'USER:SELECT'])"
                            @click="$router.push({ name: 'MisUser' })">
                            <el-icon>
                                <SvgIcon name="user_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">ユーザー管理</span>
                        </el-menu-item>
                    </el-sub-menu>
                    <el-sub-menu index="業務管理" :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'">
                        <template #title>
                            <el-icon>
                                <SvgIcon name="trust_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">業務管理</span>
                        </template>
                        <el-menu-item index="MisGoods" v-if="proxy.isAuth(['ROOT', 'GOODS:SELECT'])"
                            @click="$router.push({ name: 'MisGoods' })">
                            <el-icon>
                                <SvgIcon name="goods_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">パッケージ</span>
                        </el-menu-item>
                        <el-menu-item index="MisRule" v-if="proxy.isAuth(['ROOT', 'RULE:SELECT'])"
                            @click="$router.push({ name: 'MisRule' })">
                            <el-icon>
                                <SvgIcon name="rule_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">販促規則</span>
                        </el-menu-item>
                        <el-menu-item index="MisCustomer" v-if="proxy.isAuth(['ROOT', 'CUSTOMER:SELECT'])"
                            @click="$router.push({ name: 'MisCustomer' })">
                            <el-icon>
                                <SvgIcon name="customer_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">顧客ファイル</span>
                        </el-menu-item>
                        <el-menu-item index="MisOrder" v-if="proxy.isAuth(['ROOT', 'ORDER:SELECT'])"
                            @click="$router.push({ name: 'MisOrder' })">
                            <el-icon>
                                <SvgIcon name="order_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">注文管理</span>
                        </el-menu-item>
                        <el-menu-item index="MisCustomerIm" v-if="proxy.isAuth(['ROOT', 'CUSTOMER_IM:SELECT'])"
                            @click="$router.push({ name: 'MisCustomerIm' })">
                            <el-icon>
                                <SvgIcon name="im_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">顧客IM</span>
                        </el-menu-item>
                    </el-sub-menu>
                    <el-sub-menu index="健診管理" :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'">
                        <template #title>
                            <el-icon>
                                <SvgIcon name="night_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">健診管理</span>
                        </template>
                        <el-menu-item index="MisAppointment" v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])"
                            @click="$router.push({ name: 'MisAppointment' })">
                            <el-icon>
                                <SvgIcon name="appointment_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">健診予約</span>
                        </el-menu-item>
                        <el-menu-item index="MisCustomerCheckin"
                            v-if="proxy.isAuth(['ROOT', 'CUSTOMER_CHICKIN:SELECT'])"
                            @click="$router.push({ name: 'MisCustomerCheckin' })">
                            <el-icon>
                                <SvgIcon name="checkin_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">健診受付</span>
                        </el-menu-item>
                        <el-menu-item index="MisAppointmentRestriction"
                            v-if="proxy.isAuth(['ROOT', 'APPOINTMENT_RESTRICTION:SELECT'])"
                            @click="$router.push({ name: 'MisAppointmentRestriction' })">
                            <el-icon>
                                <SvgIcon name="setting_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">予約設定</span>
                        </el-menu-item>
                        <el-menu-item index="MisDoctorCheckup" v-if="proxy.isAuth(['ROOT', 'CHECKUP:SELECT'])"
                            @click="$router.push({ name: 'MisDoctorCheckup' })">
                            <el-icon>
                                <SvgIcon name="doctor_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">医師の診察</span>
                        </el-menu-item>
                        <el-menu-item index="MisCheckupReport" v-if="proxy.isAuth(['ROOT', 'CHECKUP_REPORT:SELECT'])"
                            @click="$router.push({ name: 'MisCheckupReport' })">
                            <el-icon>
                                <SvgIcon name="file_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">健診報告書</span>
                        </el-menu-item>
                    </el-sub-menu>
                    <el-sub-menu index="システム設定" :popper-class="'site-sidebar--' + sidebar.sidebarLayoutSkin + '-popper'"
                        v-if="proxy.isAuth(['ROOT', 'SYSTEM:SELECT'])">
                        <template #title>
                            <el-icon>
                                <SvgIcon name="system_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">システム設定</span>
                        </template>
                        <el-menu-item index="MisFlowRegulation" v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:SELECT'])"
                            @click="$router.push({ name: 'MisFlowRegulation' })">
                            <el-icon>
                                <SvgIcon name="people_fill" class="icon-svg" />
                            </el-icon>
                            <span slot="title">人数制限</span>
                        </el-menu-item>
                    </el-sub-menu>
                </el-menu>
            </div>
        </aside>

        <div class="site-content__wrapper">
            <main class="site-content" :class="{ 'site-content--tabs': $route.meta.isTab }">
                <el-tabs v-if="$route.meta.isTab" v-model="siteContent.mainTabsActiveName" :closable="true"
                    @tab-click="selectedTabHandle" @tab-remove="removeTabHandle">
                    <el-tab-pane v-for="item in siteContent.mainTabs" :label="item.title" :name="item.name">
                        <el-card :body-style="siteContent.siteContentViewHeight">
                            <!-- 避免路由引用页面的时候浏览器不刷新内容，所以给URL添加随机数参数 -->
                            <router-view :key="String(router.currentRoute.value.query.random)" />
                        </el-card>
                    </el-tab-pane>
                </el-tabs>
                <el-card v-else :body-style="siteContent.siteContentViewHeight">
                    <!-- 避免路由引用页面的时候浏览器不刷新内容，所以给URL添加随机数参数 -->
                    <router-view :key="String(router.currentRoute.value.query.random)" />
                </el-card>
            </main>
        </div>
    </div>

    <el-dialog title="提示" v-model="dialog.visible" width="25%">
        <el-form :model="dialog.dataForm" :rules="dialog.dataRule" ref="dialogForm" label-width="80px">
            <el-form-item label="元のパスワード" prop="password">
                <el-input type="password" v-model="dialog.dataForm.password" size="medium" maxlength="20" clearable />
            </el-form-item>
            <el-form-item label="新パスワード" prop="newPassword">
                <el-input type="password" v-model="dialog.dataForm.newPassword" size="medium" maxlength="20"
                    clearable />
            </el-form-item>
            <el-form-item label="確認パスワード" prop="confirmPassword">
                <el-input type="password" v-model="dialog.dataForm.confirmPassword" size="medium" maxlength="20"
                    clearable />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button size="medium" @click="dialog.visible = false">中止する</el-button>
                <el-button type="primary" size="medium" @click="dataFormSubmit">確認する</el-button>
            </span>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import SvgIcon from '../../components/SvgIcon.vue';
import { UserFilled } from '@element-plus/icons-vue';
import { isURL } from '../../utils/validate';
import { ref, reactive, provide, getCurrentInstance, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

//用于获取路由参数
const route = useRoute();
//用于切换路由引用的页面
const router = useRouter();
const instance = getCurrentInstance();
const proxy: any = instance?.proxy; // 安全访问 proxy

//左边栏常量
const sidebar = reactive({
    //是否折叠左边栏
    sidebarFold: false,
    sidebarLayoutSkin: 'dark'
});

//内容区相关常量（后续用到）
const siteContent = reactive({
    documentClientHeight: 0,
    siteContentViewHeight: {},
    height: null,
    //数据里面每个元素就是一个Tab
    mainTabs: [],
    //记录当前选中的Tab标签
    mainTabsActiveName: '',
    //记录当前选中的菜单项
    menuActiveName: ''
});


//用户信息常量
const user = reactive({
    name: '',
    photo: '',
    //是否显示修改登陆密码的弹窗
    updatePasswordVisible: false
});

//计算网页可见区域的高度
function resetDocumentClientHeight() {
    //获取网页可见区域的高度
    siteContent.documentClientHeight = document.documentElement.clientHeight;
}

//计算内容区卡片控件高度
function loadSiteContentViewHeight() {
    //卡片控件高度 = 网页可见区域高度 - 导航区高度 - 卡片控件上下外填充 - 上下边框
    let height = siteContent.documentClientHeight - 50 - 30 - 2;
    if (route.meta.isTab) {
        //如果引用的Vue页面需要Tab控件，卡片控件高度还要减去40
        height -= 40;
    }
    //保存卡片控件高度
    siteContent.height = height
    //声明CSS样式
    siteContent.siteContentViewHeight = { minHeight: height + 'px' };
}

//浏览器尺寸发生变化的回调函数
window.onresize = () => {
    //更新保存的网页可见区域高度
    siteContent.documentClientHeight = document.documentElement.clientHeight;
    //重新计算内容区的高度
    loadSiteContentViewHeight();
};


function routeHandle(route) {
    resetDocumentClientHeight();
    loadSiteContentViewHeight();

    //判断是否要创建Tab控件
    if (route.meta.isTab) {
        /* 创建Tab控件之前，先判断mainTabs[]数组中是否存在该Vue页面的Tab控件。
         * 比如我们要访问角色管理页面，程序先要判断是否存在角色管理页面的Tab控件。
         * 如果不存在就创建Tab控件；如果存在就不创建新的Tab控件，直接切换到现有的Tab控件
         */
        let tab = siteContent.mainTabs.filter(item => item.name === route.name)[0];
        if (tab == null) {
            tab = {
                title: route.meta.title,
                name: route.name
            };
            siteContent.mainTabs.push(tab);
        }
        //选中某个Tab控件
        siteContent.mainTabsActiveName = tab.name;
        //选中某个菜单项
        siteContent.menuActiveName = tab.name;
    }
    else {
        siteContent.mainTabs = []
        //取消选中某个Tab控件
        siteContent.mainTabsActiveName = "";
        //选中某个菜单项
        siteContent.menuActiveName = "Home";
    }
}

/* 
 * 载入框架页面就立即执行routeHandle()函数，把当前路由加载页面对应的Tab控件选中
 * 例如直接访问http://localhost:7600/mis/role页面，需要让框架页面创建Tab控件，并且选中该Tab
 */
routeHandle(route)

/* 
 * 框架页面的路由标签每次切换引用的页面，就调用routeHandle()，
 * 判断一下是创建新的Tab控件，还是切换到现有的Tab控件
 */
watch(
    () => router,
    () => {
        routeHandle(route);
    },
    { immediate: true, deep: true }
);

function selectedTabHandle(tab) {
    router.push({
        name: tab.paneName
    });
}

function removeTabHandle(tabName) {
    //让mainTabs数组剔除要关闭的Tab
    siteContent.mainTabs = siteContent.mainTabs.filter(item => item.name !== tabName);
    //如果还存在剩余的Tab，就切换到最后的Tab上面
    if (siteContent.mainTabs.length >= 1) {
        //获取mainTabs数组最后一个元素
        let tab = siteContent.mainTabs[siteContent.mainTabs.length - 1];
        //选中这个Tab控件
        siteContent.mainTabsActiveName = tab.name;
        //内容区切换引用的页面
        router.push({ name: tab.name });
    } else {
        siteContent.mainTabsActiveName = '';
        router.push({ name: 'MisHome' });
    }
}

function handleSwitch() {
    sidebar.sidebarFold = !sidebar.sidebarFold;
}

const logout = () => {
    proxy.$http('/mis/user/logout', 'GET', null, true, (resp: any) => {
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');
        router.push({ name: 'MisLogin' });
    });
}

const validateConfirmPassword = (rule, value, callback) => {
    if (value != dialog.dataForm.newPassword) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};
const dialog = reactive({
    visible: false,
    dataForm: {
        password: '',
        newPassword: '',
        confirmPassword: ''
    },
    dataRule: {
        password: [{ required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: 'パスワードの形式が誤っています' }],
        newPassword: [{ required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: 'パスワードの形式が誤っています' }],
        confirmPassword: [
            { required: true, pattern: '^[a-zA-Z0-9]{6,20}$', message: 'パスワードの形式が誤っています' },
            { validator: validateConfirmPassword, trigger: 'blur' }
        ]
    }
});

function updatePassword() {
    dialog.visible = true;
    //清空上一次的验证结果
    proxy.$nextTick(function () {
        proxy.$refs['dialogForm'].resetFields();
    })
}

function dataFormSubmit() {
    //验证Form表单中的控件内容
    proxy.$refs['dialogForm'].validate(valid => {
        if (valid) {
            let json = {
                password: dialog.dataForm.password,
                newPassword: dialog.dataForm.confirmPassword
            };
            proxy.$http('/mis/user/updatePassword', 'POST', json, true, function (resp) {
                if (resp.rows == 1) {
                    proxy.$message({
                        message: 'パスワードの変更が成功しました',
                        type: 'success',
                        duration: 1200,
                        onClose: () => {
                            dialog.visible = false;
                        }
                    });
                } else {
                    proxy.$message({
                        message: 'パスワードの変更に失敗しました',
                        type: 'error',
                        duration: 1200
                    });
                }
            });
        }
    });
}


</script>


<style lang="scss">
@import '../../assets/scss/index.scss';

.avatar-container {
    vertical-align: -8px;
    margin-right: 5px;
}
</style>
