<template>
    <div class="container">
        <header>
            <div class="logo-container" @click="backIndex">
                <img src="../../assets/front/index/logo.png" class="logo" />
                <div>
                    <h3>神州大健康</h3>
                    <p>www.chinahealty.com</p>
                </div>
            </div>
            <!-- 这里是新添加的内容 -->
            <div class="search-container">
                <div>
                    <el-input v-model="header.keyword" placeholder="パッケージ名または番号を入力してください" size="large" maxlength="50"
                        class="keyword-input" clearable>
                        <template #append>
                            <el-button @click="searchGoods">検索</el-button>
                        </template>
                    </el-input>
                </div>
                <div>
                    <el-tag v-for="item in header.tags" :key="item.label" :type="item.type" class="tag" effect="light"
                        round @click="tagHandle(item.label)">
                        {{ item.label }}
                    </el-tag>
                </div>
            </div>
            <!-- 这里是新添加的内容 -->
            <div class="operate-container">
                <el-button type="primary" size="large" v-if="dialog.status == 'logout'" @click="showDialog">
                    ログイン/登録
                </el-button>
                <div class="btn" v-if="dialog.status == 'login'" @click="router.push({ name: 'FrontMine' })">
                    <el-icon>
                        <User />
                    </el-icon>
                    <span>マイページ</span>
                </div>
                <div class="btn" v-if="dialog.status == 'login'" @click="logout">
                    <el-icon>
                        <SwitchButton />
                    </el-icon>
                    <span>ログアウト</span>
                </div>
            </div>
        </header>
        <!-- 避免路由引用页面的时候浏览器不刷新内容，所以给URL添加随机数参数 -->
        <router-view :key="String(router.currentRoute.value.query.random)" />
    </div>
    <footer>
        <div class="aboutus-container">
            <ul class="list">
                <li class="item">
                    <img src="../../assets/front/index/d1.svg" />
                    <div>
                        <h3>公式直営</h3>
                        <p>600以上の健康診断センターでオンライン予約、健康診断に17年間専注しています</p>
                    </div>
                </li>
                <li class="item">
                    <img src="../../assets/front/index/d2.svg" />
                    <div>
                        <h3>チームの強み</h3>
                        <p>標準化・スマート化された医療品質管理システムを構築し、全ライフサイクルにわたる健康管理サービスを提供する</p>
                    </div>
                </li>
                <li class="item">
                    <img src="../../assets/front/index/d3.svg" />
                    <div>
                        <h3>専門保証</h3>
                        <p>業界の専門家、医療技術者、看護師など約35,000人で構成された専門的な医療サービスチームを有しています</p>
                    </div>
                </li>
                <li class="item">
                    <img src="../../assets/front/index/d4.svg" />
                    <div>
                        <h3>アフターサービス</h3>
                        <p>未消費の注文は迅速に返金、期限切れの場合の返金、健康診断の保証とプライバシー保護</p>
                    </div>
                </li>
            </ul>
        </div>
        <div class="other-container">
            <ul class="list">
                <li class="left">
                    <img src="../../assets/front/index/service.png" />
                    <p class="tel">400-6578-5023</p>
                </li>
                <li>
                    <ul class="link-list">
                        <li><a href="">会社情報</a></li>
                        <li><a href="">企業紹介</a></li>
                        <li><a href="">発展の経緯</a></li>
                        <li><a href="">産業エコロジー</a></li>
                        <li><a href="">企業文化</a></li>
                    </ul>
                </li>
                <li>
                    <ul class="link-list">
                        <li><a href="">毎年のニュース</a></li>
                        <li><a href="">企業のニュース</a></li>
                        <li><a href="">メディア報道</a></li>
                        <li><a href="">党建設活動</a></li>
                    </ul>
                </li>
                <li>
                    <ul class="link-list">
                        <li><a href="">顧客サービス</a></li>
                        <li><a href="">サポートセンター</a></li>
                        <li><a href="">予約受付通路</a></li>
                        <li><a href="">アフターサービス</a></li>
                        <li><a href="">プライバシーポリシー</a></li>
                    </ul>
                </li>
                <li>
                    <ul class="link-list">
                        <li><a href="">ビジネス協力</a></li>
                        <li><a href="">リンク交換</a></li>
                        <li><a href="">お問い合わせ</a></li>
                    </ul>
                </li>
                <li class="right">
                    <div class="ercode">
                        <p>WeChat公式アカウント</p>
                        <img src="../../assets/front/index/ercode-1.png" />
                    </div>
                    <div class="ercode">
                        <p>アプリをダウンロード</p>
                        <img src="../../assets/front/index/ercode-2.png" />
                    </div>
                </li>
            </ul>
        </div>
    </footer>

    <el-dialog v-model="dialog.visible" title="携帯電話でログイン" width="400" class="dialog">
        <el-row>
            <el-col :span="24">
                <el-input v-model="dialog.tel" placeholder="電話番号を入力して、ログイン" size="large" maxlength="11" clearable>
                    <template #prepend>
                        <el-icon>
                            <Iphone />
                        </el-icon>
                    </template>
                </el-input>
            </el-col>
        </el-row>
        <el-row :gutter="10">
            <el-col :span="16">
                <el-input v-model="dialog.code" placeholder="SMS認証コードを入力してください" size="large" maxlength="6" clearable>
                    <template #prepend>
                        <el-icon>
                            <Message />
                        </el-icon>
                    </template>
                </el-input>
            </el-col>
            <el-col :span="8">
                <el-button size="large" class="receive-btn" type="primary" plain @click="sendSmsCode"
                    :disabled="dialog.disabled">
                    {{ dialog.btnContent }}
                </el-button>
            </el-col>
        </el-row>
        <el-button type="primary" class="login-btn" size="large" @click="login">
            ログイン
        </el-button>
    </el-dialog>
</template>

<script lang="ts" setup>
import router from '../../router/index';
import { reactive, ref, getCurrentInstance, onMounted } from 'vue';
import { isMobile, isBlank, isSmsCode } from '../../utils/validate';
const instance = getCurrentInstance();
const proxy = instance?.proxy; // 安全访问 proxy
const header = reactive({
    keyword: '',
    tags: [
        {
            label: '入职体检',
            type: 'info'
        },
        {
            label: '父母体检',
            type: 'info'
        },
        {
            label: '女士体检',
            type: 'info'
        }
    ]
});

const dialog = reactive({
    visible: false,
    tel: null,
    code: null,
    disabled: false,
    btnContent: 'SMS認証コードを受け取る',
    num: 0,
    status: 'logout'
});

const dataRule = reactive({
    tel: [{ required: true, pattern: '^1[1-9]\d{9}$', message: '電話番号が間違っています' }]
});

function showDialog() {
    dialog.visible = true;
}

function sendSmsCode() {
    if (isBlank(dialog.tel)) {
        proxy.$message({
            message: '電話番号を入力してください',
            type: 'error',
            duration: 1200
        });
    } else if (!isMobile(dialog.tel)) {
        proxy.$message({
            message: '電話番号が間違っています',
            type: 'error',
            duration: 1200
        });
    } else {
        let json = {
            tel: dialog.tel
        };
        proxy.$http('/front/customer/sendSmsCode', 'POST', json, true, function (resp) {
            if (resp.result) {
                proxy.$message({
                    message: 'SMS認証コードが送信されました',
                    type: 'success',
                    duration: 1200
                });
                dialog.num = 0;
                dialog.disabled = true;
                //禁用按钮两分钟
                let timer = setInterval(function () {
                    dialog.num++;
                    dialog.btnContent = `再取得する(${120 - dialog.num})`;
                    if (dialog.num == 120) {
                        clearInterval(timer);
                        dialog.disabled = false;
                        dialog.btnContent = 'SMS認証コードを取得する';
                    }
                }, 1000);
            }
        });
    }
}

function login() {
    if (isBlank(dialog.tel)) {
        proxy.$message({
            message: '電話番号を入力してください',
            type: 'error',
            duration: 1200
        });
    } else if (!isMobile(dialog.tel)) {
        proxy.$message({
            message: '電話番号が間違っています',
            type: 'error',
            duration: 1200
        });
    } else if (isBlank(dialog.code)) {
        proxy.$message({
            message: 'SMS認証コードを入力してください',
            type: 'error',
            duration: 1200
        });
    } else if (!isSmsCode(dialog.code)) {
        proxy.$message({
            message: 'SMS認証コードが間違っています',
            type: 'error',
            duration: 1200
        });
    }
    let json = {
        tel: dialog.tel,
        code: dialog.code
    };
    proxy.$http('/front/customer/login', 'POST', json, true, function (resp) {
        let result = resp.result;

        if (result) {
            proxy.$message({
                message: resp.msg,
                type: 'success',
                duration: 1200
            });
            dialog.tel = null;
            dialog.code = null;
            dialog.visible = false;
            dialog.status = 'login';
            let token = resp.token;
            localStorage.setItem('token', token);
        } else {
            proxy.$message({
                message: resp.msg,
                type: 'error',
                duration: 1200
            });
        }
    });
}

function logout() {
    proxy.$http('/front/customer/logout', 'GET', null, true, function (resp) {
        localStorage.removeItem('token');
        dialog.status = 'logout';
        router.push({ name: 'FrontIndex' });
        proxy.$message({
            message: 'すでにログアウトしました',
            type: 'success',
            duration: 1200
        });
    });
}

let token = localStorage.getItem('token');
if (token != null) {
    //检查重新登陆
    proxy.$http('/front/customer/checkLogin', 'GET', null, true, function (resp) {
        if (resp.result) {
            dialog.status = 'login';
        } else {
            dialog.status = 'logout';
        }
    });
}

function backIndex() {
    router.push({ name: 'FrontIndex' });
}

//从URL地址获取keyword参数，更新到文本框，避免页面刷新后文本框没有数据
let keyword = router.currentRoute.value.query.keyword;
header.keyword = keyword;

function searchGoods() {
    router.push(
        { 
          name: 'FrontGoodsList', 
          query: { keyword: header.keyword, random: new Date().getTime() } 
        }
    );
}

function tagHandle(label : string) {
    header.keyword = label;
}
</script>

<style lang="less" scoped>
@import url('main.less');
</style>
