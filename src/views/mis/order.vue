<template>
    <div v-if="proxy.isAuth(['ROOT', 'ORDER:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item prop="code">
                <el-input v-model="dataForm.code" placeholder="パッケージ番号" maxlength="20" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="keyword">
                <el-input v-model="dataForm.keyword" placeholder="パッケージ名" class="keyword" maxlength="50"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="tel">
                <el-input v-model="dataForm.tel" placeholder="電話番号" maxlength="11" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item class="range">
                <el-date-picker v-model="dataForm.dateRange" type="daterange" range-separator="~"
                    start-placeholder="開始日" end-placeholder="終了日" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item>
                <el-select v-model="dataForm.status" class="input" placeholder="注文状態" clearable="clearable">
                    <el-option label="未払い" value="1" />
                    <el-option label="閉じました" value="2" />
                    <el-option label="支払い済み" value="3" />
                    <el-option label="返金済み" value="4" />
                    <el-option label="予約済み" value="5" />
                    <el-option label="終了" value="6" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">検索</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" v-if="proxy.isAuth(['ROOT', 'ORDER:UPDATE'])" :icon="Refresh"
                    @click="checkPaymentResultHandle()">支払い結果の反映</el-button>
            </el-form-item>
        </el-form>

        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
            @selection-change="selectionChangeHandle" @expand-change="expand" :row-key="data.getRowKeys"
            :expand-row-keys="data.expands">
            <el-table-column type="expand">
                <template #default="scope">
                    <div class="content-container">
                        <div class="left-panel">
                            <el-card class="box-card" shadow="never">
                                <div class="info">
                                    <div class="left">
                                        <el-avatar :size="57" shape="square" :src="scope.row.photo">
                                            <el-icon size="35">
                                                <UserFilled />
                                            </el-icon>
                                        </el-avatar>
                                    </div>
                                    <div class="right">
                                        <h4 class="customer-name">{{ scope.row.name }}</h4>
                                        <p class="customer-desc">
                                            <el-icon class="icon">
                                                <User />
                                            </el-icon>
                                            <span class="value">{{ scope.row.sex }}</span>
                                            <el-icon class="icon">
                                                <Phone />
                                            </el-icon>
                                            <span class="value">{{ scope.row.tel }}</span>
                                            <el-icon class="icon">
                                                <Calendar />
                                            </el-icon>
                                            <span class="value">{{ scope.row.registerTime }}</span>
                                        </p>
                                    </div>
                                </div>
                                <el-divider />
                                <el-row :gutter="16">
                                    <el-col :span="6">
                                        <div class="statistic-card">
                                            <el-statistic :value="scope.row.number - scope.row.num" suffix="个">
                                                <template #title>
                                                    <div class="title">予約できる健康診断</div>
                                                </template>
                                            </el-statistic>
                                        </div>
                                    </el-col>
                                    <el-col :span="6">
                                        <div class="statistic-card">
                                            <el-statistic :value="scope.row.num" suffix="个">
                                                <template #title>
                                                    <div class="title">予約済みの健康診断</div>
                                                </template>
                                            </el-statistic>
                                        </div>
                                    </el-col>
                                    <el-col :span="6">
                                        <div class="statistic-card">
                                            <el-statistic :value="scope.row.number" suffix="个">
                                                <template #title>
                                                    <div class="title">総計数量</div>
                                                </template>
                                            </el-statistic>
                                        </div>
                                    </el-col>
                                </el-row>
                            </el-card>
                            <el-descriptions :column="1" class="order-code" border>
                                <el-descriptions-item label="注文番号：" label-align="center">
                                    {{ scope.row.outTradeNo }}
                                </el-descriptions-item>
                                <el-descriptions-item label="支払い番号：" label-align="center">
                                    {{ scope.row.transactionId == null ? "無し" : scope.row.transactionId }}
                                </el-descriptions-item>
                                <el-descriptions-item label="返金番号：" label-align="center">
                                    {{ scope.row.outRefundNo == null ? "無し" : scope.row.outRefundNo }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>
                        <div class="right-panel">
                            <el-table :data="data.appointment" :header-cell-style="{ 'background': '#f5f7fa' }"
                                height="350" border>
                                <el-table-column label="番号" type="index" label-align="center" align="center"
                                    min-width="90">
                                    <template #default="scope">
                                        <span>{{ scope.$index + 1 }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="name" label="健診受診者" label-align="center" align="center"
                                    min-width="180" />
                                <el-table-column prop="sex" label="性别" label-align="center" align="center"
                                    min-width="120" />
                                <el-table-column prop="age" label="年齢" label-align="center" align="center"
                                    min-width="120" />
                                <el-table-column prop="tel" label="電話番号" label-align="center" align="center"
                                    min-width="180" />
                                <el-table-column prop="date" label="健康診断日" label-align="center" align="center"
                                    min-width="180" />
                                <el-table-column prop="status" label="状態" label-align="center" align="center"
                                    min-width="130" />
                            </el-table>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="selection" header-align="center" align="center" width="50"
                :selectable="selectable" />
            <el-table-column type="index" header-align="center" align="center" width="100" label="番号">
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="goodsTitle" header-align="left" align="left" min-width="220" label="パッケージ名" />
            <el-table-column header-align="center" align="center" min-width="80" label="価格">
                <template #default="scope">
                    <span>￥{{ scope.row.goodsPrice }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="number" header-align="center" align="center" min-width="100" label="数量" />
            <el-table-column header-align="center" align="center" min-width="100" label="総計">
                <template #default="scope">
                    <span>￥{{ scope.row.amount }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="status" header-align="center" align="center" min-width="100" label="状態" />
            <el-table-column prop="createTime" header-align="center" align="center" min-width="100" label="注文時間" />
            <el-table-column prop="refundTime" header-align="center" align="center" min-width="100" label="返金時間" />
            <el-table-column header-align="center" align="center" width="200" label="操作">
                <template #default="scope">
                    <el-button type="text" v-if="proxy.isAuth(['ROOT', 'ORDER:SELECT'])"
                        @click="viewHandle(scope.row.snapshotId)">
                        プレビュー
                    </el-button>
                    <el-button type="text" v-if="proxy.isAuth(['ROOT', 'ORDER:DELETE'])"
                        :disabled="scope.row.status != '閉じました'" @click="deleteHandle(scope.row.id)">
                        削除
                    </el-button>
                    <el-button type="text" v-if="proxy.isAuth(['ROOT', 'ORDER:UPDATE'])"
                        :disabled="scope.row.status != '支払い済み'" @click="updateHandle(scope.row.id)">
                        オフライン返金
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>
</template>

<script lang="ts" setup>
import { reactive, getCurrentInstance, ref } from 'vue';
import router from '../../router/index';
import { Refresh } from '@element-plus/icons-vue'

const instance = getCurrentInstance();
const proxy: any = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
    code: null,
    keyword: null,
    tel: null,
    dateRange: [],
    status: null
});

const dataRule = reactive({
    code: [
        { min: 6, message: '番号は6文字以上でなければなりません' },
        { pattern: '^[a-zA-Z0-9]{6,20}$', message: '番号の形式が誤っています' }
    ],
    keword: [
        { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: '氏名の形式が誤っています' }
    ],
    tel: [
        { pattern: '^1[1-9]\\d{9}$', message: '電話番号の形式が誤っています' }
    ]
});

const data = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: [],
    expands: [],
    getRowKeys(row) {
        return row.id;
    },
    appointment: []
});

function loadDataList() {
    data.loading = true;
    let range = dataForm.dateRange
    let json = {
        page: data.pageIndex,
        length: data.pageSize,
        keyword: dataForm.keyword,
        code: dataForm.code,
        tel: dataForm.tel,
        status: dataForm.status,
        startDate: (range != null && range.length == 2) ? range[0] : null,
        endDate: (range != null && range.length == 2) ? range[1] : null,
    };
    proxy.$http('/mis/order/searchByPage', 'POST', json, true, function (resp) {
        let statusEnum = {
            "1": "未払い",
            "2": "閉じました",
            "3": "支払い済み",
            "4": "返金済み",
            "5": "予約済み",
            "6": "終了"
        }
        let page = resp.page;
        let list = page.list;
        for (let one of list) {
            one.status = statusEnum[one.status + ""]
        }
        data.dataList = list;
        data.totalCount = page.totalCount;
        data.loading = false;
    });
}

loadDataList();

function searchHandle() {
    proxy.$refs['form'].validate(valid => {
        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (dataForm.keyword == '') {
                dataForm.keyword = null;
            }
            if (dataForm.code == '') {
                dataForm.code = null;
            }
            if (dataForm.tel == '') {
                dataForm.tel = null;
            }
            if (dataForm.status == '') {
                dataForm.status = null;
            }
            if (data.pageIndex != 1) {
                data.pageIndex = 1;
            }
            loadDataList();
        } else {
            return false;
        }
    });
}

function sizeChangeHandle(val) {
    data.pageSize = val;
    data.pageIndex = 1;
    loadDataList();
}
function currentChangeHandle(val) {
    data.pageIndex = val;
    loadDataList();
}

function expand(row, expandedRows) {
    if (expandedRows.length > 0) {
        //先把所有展开的面板收起
        data.expands = [];
        if (row) {
            data.appointment = []
            let json = {
                orderId: row.id
            }
            proxy.$http("/mis/appointment/searchByOrderId", "POST", json, true, function (resp) {
                let result = resp.result
                let statusEnum = {
                    "1": "未記入",
                    "2": "記入済み",
                    "3": "終了",
                    "4": "閉じました"
                }
                for (let one of result) {
                    one.status = statusEnum[one.status + ""]
                }
                data.appointment = result

            })
            //展开订单记录的折叠面板
            data.expands.push(row.id);
        } else {
            data.expands = [];
        }
    }
}

function viewHandle(snapshotId) {
    router.push(
        { name: 'FrontGoodsSnapshot', params: { id: snapshotId, mode: "mis" } }
    );
}

function selectable(row, index) {
    if (["未払い", "閉じました"].includes(row.status)) {
        return true;
    }
    return false;
}

function selectionChangeHandle(val) {
    data.selections = val;
}

function checkPaymentResultHandle() {
    //提取选中订单记录的订单流水号
    let outTradeNoArray = data.selections.map(item => {
        return item.outTradeNo;
    });
    if (outTradeNoArray == null || outTradeNoArray.length == 0) {
        proxy.$message({
            message: '選択した記録がありません',
            type: 'error',
            duration: 1200
        });
        return;
    }
    let json = {
        outTradeNoArray: outTradeNoArray
    }
    proxy.$http('/mis/order/checkPaymentResult', 'POST', json, true, function (resp) {
        if (resp.rows > 0) {
            proxy.$message({
                message: `${resp.rows}5件の支払い記録が正常に同期されました`,
                type: 'success',
                duration: 1200,
                onClose: () => {
                    loadDataList();
                }
            });
        } else {
            proxy.$message({
                message: 'これらの注文の支払い成功が確認できません',
                type: 'warning',
                duration: 1200
            });
        }
    });
}

function deleteHandle(id) {
    proxy.$confirm('選択した記録を削除してもよろしいですか？', '提示', {
        confirmButtonText: '確認する',
        cancelButtonText: '中止する',
        type: 'warning'
    }).then(() => {
        let json = { "id": id }
        proxy.$http('/mis/order/deleteById', 'POST', json, true, function (resp) {
            if (resp.rows > 0) {
                proxy.$message({
                    message: '操作に成功しました。',
                    type: 'success',
                    duration: 1200,
                    onClose: () => {
                        loadDataList();
                    }
                });
            } else {
                proxy.$message({
                    message: '記録を削除できませんでした',
                    type: 'warning',
                    duration: 1200
                });
            }
        });
    });
}

function updateHandle(id) {
    proxy.$confirm('この注文はすでにオフラインで返金が成功したことを確認しましたか？', '提示', {
        confirmButtonText: '確認する',
        cancelButtonText: '中止する',
        type: 'warning'
    }).then(() => {
        let json = { "id": id }
        proxy.$http('/mis/order/updateRefundStatusById', 'POST', json, true, function (resp) {
            if (resp.rows > 0) {
                proxy.$message({
                    message: '操作に成功しました。',
                    type: 'success',
                    duration: 1200,
                    onClose: () => {
                        loadDataList();
                    }
                });
            } else {
                proxy.$message({
                    message: '注文状態の更新に失敗しました',
                    type: 'warning',
                    duration: 1200
                });
            }
        });
    });
}
</script>

<style lang="less" scoped>
@import url('order.less');
</style>