<template>
    <div class="panel-container">
        <div class="home-TUIKit-main" :style="data.siteContent.style">
            <div class="conversation">
                <!-- <TUISearch class="TUIKit-search" /> -->
                <TUIConversation @handleSwitchConversation="handleCurrentConversation" />
            </div>
            <div class="TUIKit-chat">
                <TUIChat />
            </div>
        </div>
        <div class="customer-info">
            <el-card class="box-card" shadow="never">
                <div class="info">
                    <div class="left">
                        <el-avatar :size="57" shape="square" :src="data.customer.photo">
                            <el-icon size="35">
                                <UserFilled />
                            </el-icon>
                        </el-avatar>
                    </div>
                    <div class="right">
                        <h4 class="customer-name">{{ data.customer.name }}</h4>
                        <p class="customer-desc">
                            <el-icon class="icon">
                                <User />
                            </el-icon>
                            <span class="value">{{ data.customer.sex }}</span>
                            <el-icon class="icon">
                                <Phone />
                            </el-icon>
                            <span class="value">{{ data.customer.tel }}</span>
                            <el-icon class="icon">
                                <Calendar />
                            </el-icon>
                            <span class="value">{{ data.customer.createTime }}</span>
                        </p>
                    </div>
                </div>
                <el-divider />
                <el-row :gutter="16">
                    <el-col :span="10">
                        <div class="statistic-card">
                            <el-statistic :value="data.statistic.amount" suffix="元">
                                <template #title>
                                    <div class="title">累計消費金額</div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="7">
                        <div class="statistic-card">
                            <el-statistic :value="data.statistic.count" suffix="笔">
                                <template #title>
                                    <div class="title">有効注文数</div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                    <el-col :span="7">
                        <div class="statistic-card">
                            <el-statistic :value="data.statistic.number" suffix="个">
                                <template #title>
                                    <div class="title">健診パッケージの数量</div>
                                </template>
                            </el-statistic>
                        </div>
                    </el-col>
                </el-row>
            </el-card>
            <el-table :data="data.order.dataList" border style="width: 100%" class="orders-table"
                :header-cell-style="{ 'background': '#f5f7fa' }">
                <el-table-column type="index" header-align="center" align="center" width="80" label="序号">
                    <template #default="scope">
                        <span>{{ (data.order.pageIndex - 1) * data.order.pageSize + scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="goodsTitle" label="套餐名称" header-align="left" align="left" min-width="200" />
                <el-table-column prop="createDate" label="購入日" header-align="center" align="center" min-width="120" />
                <el-table-column prop="status" label="状態" header-align="center" align="center" min-width="100" />
            </el-table>
            <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
                :current-page="data.order.pageIndex" :page-sizes="[5, 10, 20, 50]" :page-size="data.order.pageSize"
                :total="data.order.totalCount" layout="total, sizes, prev, pager, next, jumper">
            </el-pagination>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, type Ref, getCurrentInstance } from 'vue';
import { TUISearch, TUIConversation, TUIChat } from '../../TUIKit';
import { TUILogin } from '@tencentcloud/tui-core';
import { framework } from '../../TUIKit/adapter-vue';
const instance = getCurrentInstance();
const proxy: any = instance?.proxy; // 安全访问 proxy

const data = reactive({
    siteContent: {
        documentClientHeight: 0,
        height: null,
        style: null
    },
    customer: {
        id: null,
        name: "--",
        sex: "--",
        tel: "--",
        photo: "--",
        createTime: "--"
    },
    statistic: {
        amount: 0,
        count: 0,
        number: 0
    },
    order: {
        dataList: [],
        pageIndex: 1,
        pageSize: 5,
        totalCount: 0,
        loading: false,
    }
});

proxy.$http("/mis/customer/im/searchServiceAccount", "GET", null, true, function (resp) {
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
data.siteContent.documentClientHeight = document.documentElement['clientHeight'];

function loadSiteContentViewHeight() {
    let height = data.siteContent.documentClientHeight - 50 - 30 - 2;
    height -= 80;
    data.siteContent.height = height
    data.siteContent.style = `height: ${height}px`
}
loadSiteContentViewHeight();

window.onresize = () => {
    data.siteContent.documentClientHeight = document.documentElement['clientHeight'];
    loadSiteContentViewHeight();
};

function loadOrderList() {
    data.order.loading = true;
    let json = {
        customerId: data.customer.id,
        page: data.order.pageIndex,
        length: data.order.pageSize
    }
  
    proxy.$http("/mis/order/searchByPage", "POST", json, true, function (resp) {
        let statusEnum = {
            "1": "未付款",
            "2": "閉じました",
            "3": "支払い済み",
            "4": "返金済み",
            "5": "予約済み",
            "6": "終了",
        }
        let page = resp.page;
        for (let one of page.list) {
            one.status = statusEnum[one.status + ""]
        }
        data.order.dataList = page.list
        data.order.totalCount = page.totalCount;
        data.order.loading = false;
    })
}

const handleCurrentConversation = (value : string) => {
    console.log(123);
    let account = value.substr(3);  //获取客户IM账号
    let customerId = account.split("_")[1]  //获取客户主键值
    data.customer.id = customerId
    let json = { customerId: customerId }
    //查询客户基本信息和订单统计数据
    proxy.$http("/mis/customer/searchSummary", "POST", json, true, function (resp) {
        let result = resp.result
        data.customer.name = result.name
        data.customer.sex = result.sex
        data.customer.tel = result.tel
        data.customer.createTime = result.createTime
        data.customer.photo = result.photo
        data.statistic.amount = result.amount
        data.statistic.count = result.count
        data.statistic.number = result.number
    })
  
    //加载订单分页记录
    loadOrderList()
};

function sizeChangeHandle(val) {
    data.order.pageSize = val;
    data.order.pageIndex = 1;
    loadOrderList();
}

function currentChangeHandle(val) {
    data.order.pageIndex = val;
    loadOrderList();
}
</script>

<style lang="less">
@import url("customer_im.less");
</style>