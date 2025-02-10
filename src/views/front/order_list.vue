<template>
    <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
        <el-form-item prop="keyword">
            <el-input v-model="dataForm.keyword" placeholder="パッケージタイトル / 注文番号" size="medium" class="keyword" maxlength="32"
                clearable="clearable" />
        </el-form-item>
        <el-form-item>
            <el-button size="medium" type="primary" :icon="Search" @click="searchHandle()">検索</el-button>
        </el-form-item>
        <el-form-item class="mold">
            <el-radio-group v-model="dataForm.statusLabel" size="medium" @change="searchHandle()">
                <el-radio-button label="すべて"></el-radio-button>
                <el-radio-button label="未払い"></el-radio-button>
                <el-radio-button label="支払い済み"></el-radio-button>
            </el-radio-group>
        </el-form-item>
    </el-form>
    <div class="order-list" v-show="!empty">
        <div class="order" v-for="one in data.dataList">
            <div class="header">
                <div class="datetime">{{ one.createTime }}</div>
                <div class="uuid">
                    注文番号：
                    <span>{{ one.outTradeNo }}</span>
                </div>
                <div class="detail" @click="searchDetailHandle(one.snapshotId)">商品詳細を見る</div>
            </div>
            <div class="content">
                <img :src="one.goodsImage" class="image" />
                <!--这里的宽度要调整-->
                <div class="info">
                    <h4>{{ one.goodsTitle }}</h4>
                    <p>{{ one.goodsDescription }}</p>
                </div>
                <div class="price">
                    <span class="label">パッケージ単価</span>
                    <span class="value">￥{{ one.goodsPrice }}</span>
                </div>
                <div class="number">
                    <span class="label">購入数量</span>
                    <span class="value">×{{ one.number }}</span>
                </div>
                <div class="amount">
                    <span class="label">合計</span>
                    <span class="value">￥{{ one.amount }}</span>
                </div>
                <div class="status">
                    <span class="label">状態</span>
                    <span class="value">{{ one.status }}</span>
                </div>
                <div class="operate">
                    <el-button v-if="one.status == '未払い'" type="primary" :disabled="one.disabled"
                        @click="paymentHandle(one.outTradeNo)">
                        支払い
                    </el-button>
                    <el-button v-if="one.status == '未払い'" type="danger" @click="closeOrderHandle(one.id)">
                        キャンセルする
                    </el-button>
                    <el-button v-if="['支払い済み', '予約済み'].includes(one.status)" type="primary"
                        :disabled="one.appointCount == one.number"
                        @click="appointHandle(one.id, one.number, one.appointCount)">
                        健診を予約する
                    </el-button>
                    <el-button v-if="one.status == '終了済み'">領収書を取得する</el-button>
                    <el-button v-if="one.status == '支払い済み'" type="danger" :disabled="one.appointCount == one.number"
                        @click="refundHandle(one.id)">
                        返金
                    </el-button>
                </div>
            </div>
        </div>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    </div>
    <div class="empty" v-show="empty">
        <el-empty :image-size="200" />
    </div>

    <el-dialog title="注文を支払う" :close-on-click-modal="false" v-model="payOrderDialog.visible" width="305px" center>
        <img :src="payOrderDialog.qrCode" class="qrCode" v-if="!payOrderDialog.result" />
        <div v-if="payOrderDialog.result" class="pay-success">
            <el-result icon="success" title="支払い成功" subTitle="指示に従って操作してください"></el-result>
        </div>
        <div class="dialog-footer-style">
            <el-button type="danger" size="medium" v-if="!payOrderDialog.result" @click="closeHandle">
                キャンセルする
            </el-button>
            <el-button type="primary" size="medium" v-if="!payOrderDialog.result" @click="successHandle">
                支払い成功
            </el-button>
            <el-button type="primary" size="medium" v-if="payOrderDialog.result" @click="closeHandle">
                閉じる
            </el-button>
        </div>
    </el-dialog>

    <el-dialog title="健康診断の予約" :close-on-click-modal="false" v-model="appointDialog.visible" width="550px">
        <el-form :model="appointDialog.dataForm" ref="dialogForm" :rules="appointDialog.dataRule" label-width="80px">
            <fieldset class="appointment">
                <legend>
                    <h4>私の予約</h4>
                </legend>
                <el-form-item label="予約日" prop="date">
                    <el-date-picker v-model="appointDialog.dataForm.date" type="date" placeholder="日付を選択する" size="medium"
                        :editable="false" format="YYYY-MM-DD" value-format="YYYY-MM-DD" :disabled-date="disabledDate" />
                    <span class="desc">注意：本日を予約することはできません</span>
                </el-form-item>
                <el-form-item label="受診者" prop="name">
                    <el-input v-model="appointDialog.dataForm.name" size="medium" placeholder="氏名を入力してください。" maxlength="10"
                        clearable />
                </el-form-item>
                <el-form-item label="身分証番号" prop="pid">
                    <el-input v-model="appointDialog.dataForm.pid" size="medium" placeholder="身分証番号を入力してください。" maxlength="18"
                        clearable />
                </el-form-item>
                <el-form-item label="電話番号" prop="tel">
                    <el-input v-model="appointDialog.dataForm.tel" size="medium" placeholder="電話番号を入力してください。" maxlength="11"
                        clearable />
                </el-form-item>
                <el-form-item label="郵送先住所" prop="mailingAddress">
                    <el-input v-model="appointDialog.dataForm.mailingAddress" size="medium" placeholder="健康診断結果を受け取るための郵送先住所を入力してください"
                        maxlength="100" clearable />
                </el-form-item>
                <el-form-item label="会社名" prop="company">
                    <el-input v-model="appointDialog.dataForm.company" size="medium" placeholder="会社名を入力してください"
                        maxlength="100" clearable />
                </el-form-item>
            </fieldset>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button size="medium" @click="appointDialog.visible = false">中止する</el-button>
                <el-button type="primary" size="medium" @click="dataFormSubmit">確認する</el-button>
            </span>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import { reactive, ref, Ref, getCurrentInstance } from 'vue';
import { Search } from '@element-plus/icons-vue';
import router from '../../router/index';

import { dayjs } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const instance = getCurrentInstance();
const proxy = instance?.proxy; // 安全访问 proxy

let empty = ref(false);

const dataForm = reactive({
    keyword: null,
    statusLabel: 'すべて',
    status: null
});

const dataRule = reactive({
    keyword: [
        { required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,32}$', message: 'キーワードの内容が正しくありません' }
    ]
});

const data = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false
});

const payOrderDialog = reactive({
    visible: false,
    result: false,
    qrCode: null,
    //订单流水号，查询付款结果时候使用
    outTradeNo: null
});

const appointDialog = reactive({
    visible: false,
    number: null,
    appointCount: null,
    dataForm: {
        orderId: null,
        date: null,
        name: null,
        pid: null,
        tel: null,
        mailingAddress: null,
        company: null
    },
    dataRule: {
        date: [{ required: true, message: '日付は必須です' }],
        name: [
            { required: true, message: '氏名を入力してください。' },
            { pattern: '^[\u4e00-\u9fa5]{2,10}$', message: '氏名の形式が誤っています' }
        ],
        pid: [
            { required: true, message: '身分証番号を入力してください。' },
            { pattern: '^[0-9Xx]{18}$', message: '身分証の形式が誤っています' }
        ],
        tel: [
            { required: true, message: '電話番号を入力してください。' },
            { pattern: '^1[1-9]\\d{9}$', message: '電話番号の形式が誤っています' }
        ],
        mailingAddress: [
            { required: true, message: '郵送先住所を入力してください。' },
            { pattern: '^[0-9A-Za-z\u4e00-\u9fa5\\-_#]{10,100}$', message: '郵送先住所の形式が誤っています' }
        ],
        company: [
            { required: false, pattern: '^[0-9A-Za-z\u4e00-\u9fa5\\-_#]{2,100}$', message: '会社名をが不正です。' }
        ]
    }
});

function disabledDate(date) {
    //只能预约未来60天的体检
    let bool = dayjs(date).isBetween(dayjs(), dayjs().add(61, 'day'));
    return !bool;
}

function loadDataList() {
    data.loading = true;

    if (dataForm.statusLabel == 'すべて') {
        dataForm.status = null;
    } else if (dataForm.statusLabel == '未払い') {
        dataForm.status = 1;
    } else {
        dataForm.status = 3;
    }
    let json = {
        page: data.pageIndex,
        length: data.pageSize,
        keyword: dataForm.keyword,
        status: dataForm.status
    };
    proxy.$http('/front/order/searchByPage', 'POST', json, true, function (resp) {
        // console.log(resp.page);
        let statusEnum = {
            '1': '未払い',
            '2': '閉じました',
            '3': '支払い済み',
            '4': '返金済み',
            '5': '予約済み',
            '6': '終了済み'
        };
        let page = resp.page;
        let list = page.list;
        for (let one of list) {
            one.goodsImage = `${proxy.$minioUrl}/${one.goodsImage}`;
            one.status = statusEnum[one.status + ""];
        }
        data.dataList = list;
        data.totalCount = page.totalCount;
        data.loading = false;
        empty = (list.length == 0);
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
            if (dataForm.status == '') {
                dataForm.status = null;
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

function refundHandle(id) {
    proxy.$confirm(`返金を実行してもよろしいですか？`, '提示情報', {
        confirmButtonText: '確認する',
        cancelButtonText: '中止する',
        type: 'warning'
    }).then(() => {
        let json = { id: id };
        proxy.$http('/front/order/refund', 'POST', json, true, function (resp) {
            if (resp.result) {
                proxy.$message({
                    message: 'すでに元の方法で返金の手続きを申請しました。後ほど返金を受け取ってください。',
                    type: 'success',
                    duration: 1200
                });
            } else {
                proxy.$message({
                    message: '返金申請に失敗しました。カスタマーサポートにご連絡ください。',
                    type: 'error',
                    duration: 1200
                });
            }
        });
    });
}

function paymentHandle(outTradeNo) {
    payOrderDialog.outTradeNo = outTradeNo;
    payOrderDialog.qrCode = null;
    payOrderDialog.result = false;
    proxy.$confirm(`この健康診断パッケージを購入してもよろしいですか？`, '提示情報', {
        confirmButtonText: '確認する',
        cancelButtonText: '中止する',
        type: 'info'
    }).then(() => {
        let json = { outTradeNo: outTradeNo };
        proxy.$http('/front/order/payOrder', 'POST', json, true, function (resp) {
            if (resp.result) {
                payOrderDialog.visible = true;
                payOrderDialog.qrCode = resp.qrCodeBase64;
                //利用WebSocket接收后端推送的付款结果
                let token = localStorage.getItem('token');
                proxy.$socket.sendObj({ opt: 'customer_payment', identity: 'customer', token: token });
                proxy.$options.sockets.onmessage = function (resp) {
                    let data = resp.data;
                    let json = JSON.parse(data);
                    if (json.result) {
                        payOrderDialog.result = true;
                        //删除消息监听
                        delete proxy.$options.sockets.onmessage;
                        loadDataList();
                    }
                };
            } else {
                ElMessageBox.alert('この注文は支払い期限を過ぎています。再度注文してお支払いください。', '提示情報', {});
            }
        });
    });
}

function successHandle() {
    //查询付款状态
    let json = { outTradeNo: payOrderDialog.outTradeNo }
    proxy.$http('/front/order/searchPaymentResult', 'POST', json, true, function (resp) {
        if (!resp.result) {
            proxy.$message({
                message: '支払いに失敗しました',
                type: 'error',
                duration: 1200
            });
        } else {
            payOrderDialog.visible = false;
            proxy.$message({
                message: '支払い済み',
                type: 'success',
                duration: 1200
            });
            loadDataList();
        }
    });
}

function closeHandle() {
    payOrderDialog.visible = false;
}

function closeOrderHandle(id) {
    proxy.$confirm('この注文を閉じてよろしいですか？', '提示情報', {
        confirmButtonText: '確認する',
        cancelButtonText: '中止する',
        type: 'warning'
    })
        .then(() => {
            let json = { id: id };
            proxy.$http('/front/order/closeOrderById', 'POST', json, true, function (resp) {
                if (resp.result) {
                    proxy.$message({
                        message: '注文は閉じられました',
                        type: 'success',
                        duration: 1200,
                        onClose: () => {
                            loadDataList();
                        }
                    });
                } else {
                    proxy.$message({
                        message: '注文のキャンセルに失敗しました',
                        type: 'error',
                        duration: 1200
                    });
                }
            });
        });
}

function searchDetailHandle(snapshotId) {
    router.push({
        name: 'FrontGoodsSnapshot',
        params: { id: snapshotId, mode: "front" }
    });
}

function appointHandle(id, number, appointCount) {
    if (appointCount == 0) {
        proxy.$confirm("この注文で健康診断を予約した後は返金できません。健康診断を予約しますか？", '提示情報', {
            confirmButtonText: '確認する',
            cancelButtonText: '中止する',
            type: 'warning'
        }).then(() => {
            appointDialog.visible = true;
            appointDialog.dataForm.orderId = id;
            appointDialog.number = number;
            appointDialog.appointCount = ++appointCount;
            proxy.$nextTick(() => {
                proxy.$refs['dialogForm'].resetFields();
            });
        });
    }
}

function dataFormSubmit() {
    proxy.$refs['dialogForm'].validate(valid => {
        if (valid) {
            let json = {
                orderId: appointDialog.dataForm.orderId,
                date: appointDialog.dataForm.date,
                name: appointDialog.dataForm.name,
                pid: appointDialog.dataForm.pid,
                tel: appointDialog.dataForm.tel,
                mailingAddress: appointDialog.dataForm.mailingAddress,
                company: appointDialog.dataForm.company
            };
            proxy.$http('/front/appointment/insert', 'POST', json, true, function (resp) {
                let result = resp.result
                if (result == "予約成功") {
                    proxy.$message({
                        message: result,
                        type: 'success',
                        duration: 1200
                    });
                    appointDialog.visible = false;
                    loadDataList();
                } else{
                    proxy.$message({
                        message: result,
                        type: 'error',
                        duration: 1200
                    });
                }
            });
        }
    });
}
</script>

<style lang="less" scoped>
@import url(order_list.less);
</style>
