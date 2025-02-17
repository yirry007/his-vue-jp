<template>
    <div class="goods-detail">
        <img :src="data.image" class="cover" />
        <div class="property">
            <h3 class="title">{{ data.title }} {{ data.code }}</h3>
            <p class="desc">{{ data.description }}</p>
            <div class="row">
                <label>公式価格：</label>
                <div class="info">
                    <span class="current-price">{{ data.currentPrice }}</span>
                    <span class="initial-price">￥{{ data.initialPrice }}</span>
                </div>
            </div>
            <div class="row">
                <label>割引き：</label>
                <div class="info">
                    <img src="../../assets/front/goods/discount.png" class="discount-img" />
                    <span class="discount">{{ data.ruleName != null ? data.ruleName : '无' }}</span>
                </div>
            </div>
            <!--下面的标签是新添加的-->
            <div class="row">
                <label>商品タイプ：</label>
                <div class="info">仮想カード</div>
            </div>
            <div class="row">
                <label>適用対象者：</label>
                <div class="info">{{ data.type }}</div>
            </div>
            <div class="row">
                <label>購入数量：</label>
                <div class="info">
                    <el-input-number v-model="dataForm.number" size="small" :min="1" :max="10" @change="handleChange" />
                </div>
            </div>
            <div class="row">
                <label>サービス保証：</label>
                <div class="info">
                    <img src="../../assets/front/goods/property-icon-1.png" class="property-icon" />
                    <span class="service-tag">専門的な品質</span>
                    <img src="../../assets/front/goods/property-icon-2.png" class="property-icon" />
                    <span class="service-tag">公式直営</span>
                    <img src="../../assets/front/goods/property-icon-3.png" class="property-icon" />
                    <span class="service-tag">随時変更</span>
                    <img src="../../assets/front/goods/property-icon-4.png" class="property-icon" />
                    <span class="service-tag">随時返品</span>
                </div>
            </div>
            <div class="operate">
                <div class="consult-btn" @click="consultHandle">
                    <img src="../../assets/front/goods/consult.png" class="consult-icon" />
                    <span>お問い合わせ</span>
                </div>
                <div class="buy-btn" @click="createPayment">支払う</div>
            </div>
        </div>
    </div>
    <el-divider />
    <div class="goods-content">
        <el-descriptions title="商品概要" :column="3" size="large" border>
            <el-descriptions-item label="検査名" label-align="center">
                {{ data.title }} {{ data.code }}
            </el-descriptions-item>
            <el-descriptions-item label="検査の種類" label-align="center">{{ data.type }}</el-descriptions-item>
            <el-descriptions-item label="適用対象者" label-align="center">
                <span class="tag" v-for="one in data.tag">{{ one }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="検査機関" label-align="center">
                北京市神州大健康体检中心（东直门外大街234号）
            </el-descriptions-item>
            <el-descriptions-item label="検査項目" label-align="center">{{ data.checkupCount }}个</el-descriptions-item>
            <el-descriptions-item label="有効期限" label-align="center">一年</el-descriptions-item>
        </el-descriptions>
        <div class="detail">
            <fieldset>
                <legend>検査項目明細</legend>
                <div v-if="data.count_1 > 0">
                    <h4 class="detail-title">科室別検査({{ data.count_1 }}項目)</h4>
                    <table class="detail-table">
                        <tr v-for="one in data.checkup_1">
                            <th>{{ one.title }}</th>
                            <td>{{ one.content }}</td>
                        </tr>
                    </table>
                </div>
                <div v-if="data.count_2 > 0">
                    <h4 class="detail-title">実験室検査({{ data.count_2 }}項目)</h4>
                    <table class="detail-table">
                        <tr v-for="one in data.checkup_2">
                            <th>{{ one.title }}</th>
                            <td>{{ one.content }}</td>
                        </tr>
                    </table>
                </div>
                <div v-if="data.count_3 > 0">
                    <h4 class="detail-title">医療技術検査({{ data.count_3 }}項目)</h4>
                    <table class="detail-table">
                        <tr v-for="one in data.checkup_3">
                            <th>{{ one.title }}</th>
                            <td>{{ one.content }}</td>
                        </tr>
                    </table>
                </div>
                <div v-if="data.count_4 > 0">
                    <h4 class="detail-title">その他の検査({{ data.count_4 }}項目)</h4>
                    <table class="detail-table">
                        <tr v-for="one in data.checkup_4">
                            <th>{{ one.title }}</th>
                            <td>{{ one.content }}</td>
                        </tr>
                    </table>
                </div>
            </fieldset>
        </div>
    </div>
    <div class="checkup-appointment">
        <fieldset>
            <legend>予約に関する注意点</legend>
            <el-descriptions title="" :column="1" size="large" class="descriptions">
                <el-descriptions-item label="予約時間：" label-align="center" style="width:300px">
                    この病院は事前予約を受け付けています。当日予約を希望する場合は、08:30前に注文してください。
                </el-descriptions-item>
                <el-descriptions-item label="営業時間：" label-align="center">
                    月曜日から金曜日の08:00-10:30（来院時間は08:00-10:30です）
                </el-descriptions-item>
                <el-descriptions-item label="検査場所：" label-align="center">
                    北京市東城区東直門外大街234号 神州大健康健康診断センター
                </el-descriptions-item>
                <el-descriptions-item label="検査証明書：" label-align="center">
                    健康診断当日は、予約成功の通知短信を提示し、現地で身分証を見せることで、健康診断を受けることができます。
                </el-descriptions-item>
                <el-descriptions-item label="割引情報：" label-align="center">
                    会員がオンラインで支払いをする際に、“立減”（割引）と記載されたパッケージは、支払い時に自動的に対応する金額が差し引かれます。
                </el-descriptions-item>
                <el-descriptions-item label="注文の変更：" label-align="center">
                    お客様が予約成功後に返金を選択した場合、パッケージ実際支払金額の10%をサービス料として差し引かれます。最大差し引き額は100元を超えません。（一部の健康診断センターでは個別の返金ポリシーが適用されます）
                </el-descriptions-item>
                <el-descriptions-item label="注意事項：" label-align="center">
                    パッケージを予約する際には、検査のすべての項目を受け入れることを意味します。ご自身の都合でパッケージ内の検査項目を放棄した場合、サイトでは返金を行いません。
                </el-descriptions-item>
                <el-descriptions-item label="領収書申請：" label-align="center">
                    健康診断後に「私の注文」から申請してください。領収書発行の具体的な手順について知りたい場合は、注文を提出後に中康健康診断サイトのカスタマーサービスに迅速に連絡してください。カスタマーサービスホットライン：4008007580
                </el-descriptions-item>
            </el-descriptions>
        </fieldset>

        <fieldset>
            <legend>オンライン予約の利点</legend>
            <div class="content">
                <div class="advantage">
                    <div class="card">
                        <div class="left"><span>事前に来院可能か確認</span></div>
                        <div class="right">
                            <span>健康診断の時間とパッケージを事前に選び、予約枠不足による当日受診不可を防ぎましょう。</span>
                        </div>
                    </div>
                    <div class="card">
                        <div class="left"><span>時間を節約、便利で並ばず</span></div>
                        <div class="right">
                            <span>健康診断当日は、身分証と診断票を持参すれば、すぐ受診できます。支払いの列は不要です。</span>
                        </div>
                    </div>
                    <div class="card">
                        <div class="left"><span>電話で柔軟に変更可能</span></div>
                        <div class="right">
                            <span>予約後、日程変更は事前に電話連絡すれば調整可能です。</span>
                        </div>
                    </div>
                    <div class="card">
                        <div class="left"><span>割引て費用を節約する</span></div>
                        <div class="right">
                            <span>"オンライン健康診断パッケージなら、団体割引で病院価格の7～9割で利用できます。</span>
                        </div>
                    </div>
                </div>
                <div class="timeline">
                    <ul>
                        <li>
                            <img src="../../assets/front/goods/timeline-icon-1.png" class="list-img" />
                            <div class="list-line"></div>
                            <div class="list-tag">
                                <img src="../../assets/front/goods/timeline-tag-1.png" />
                                <span>1</span>
                            </div>
                            <div class="list-content">
                                <h4>健康診断パッケージを選んで購入する</h4>
                                <p>注文に誤りがないことを確認した後、オンラインでの支払いを完了してください</p>
                            </div>
                        </li>
                        <li>
                            <img src="../../assets/front/goods/timeline-icon-2.png" class="list-img" />
                            <div class="list-line"></div>
                            <div class="list-tag">
                                <img src="../../assets/front/goods/timeline-tag-2.png" />
                                <span>2</span>
                            </div>
                            <div class="list-content">
                                <h4>健康診断の予約を完了する</h4>
                                <p>健康診断を受ける人の情報と健康診断の日付を記入する</p>
                            </div>
                        </li>
                        <li>
                            <img src="../../assets/front/goods/timeline-icon-3.png" class="list-img" />
                            <div class="list-line"></div>
                            <div class="list-tag">
                                <img src="../../assets/front/goods/timeline-tag-3.png" />
                                <span>3</span>
                            </div>
                            <div class="list-content">
                                <h4>来院して健康診断を受ける</h4>
                                <p>病院に到着後、身分証を提示して健康診断票を受け取り、健康診断を受ける</p>
                            </div>
                        </li>
                        <li>
                            <img src="../../assets/front/goods/timeline-icon-4.png" class="list-img" />
                            <div class="list-line"></div>
                            <div class="list-tag">
                                <img src="../../assets/front/goods/timeline-tag-4.png" />
                                <span>4</span>
                            </div>
                            <div class="list-content">
                                <h4>健康診断報告書を取得する</h4>
                                <p>病院の状況に応じて、受付で登録して自分で受け取るか、自己負担で郵送してもらう</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </fieldset>

        <fieldset>
            <legend>健康診断の注意事項</legend>
            <div class="content">
                <ul class="look-list">
                    <li class="item">
                        <div class="left">健診前</div>
                        <div class="right">
                            <ul>
                                <li>
                                    <p>
                                        健康診断の前日は軽い食事を心がけ、お酒を飲まず、無理をしないようにしてください。健康診断当日は空腹でお越しください。
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        健康診断の前日は休息を十分にとり、夜8時以降は食事を控えてください。激しい運動や感情の高ぶりを避け、十分な睡眠を確保してください。これにより、健康診断の結果に影響を与えないようにしましょう。
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        生理期間中は婦人科検診や尿検査を避けるべきです。
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li class="item">
                        <div class="left">健診中</div>
                        <div class="right">
                            <ul>
                                <li>
                                    <p>
                                        空腹での検査が必要な項目は、採血、腹部超音波、デジタル胃腸検査、胃カメラおよびその他指定された健康診断項目です。
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        膀胱、子宮、付属器の超音波検査を受ける前に排尿しないでください。尿がない場合は、水を飲んで膀胱を満たしてください。婦人科検査を受ける前には、尿を排出しておいてください。
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        未婚女性は婦人科検査を受けないでください。妊娠中の女性は、事前に医療スタッフに知らせてください。放射線検査やその他影響がある検査は実施しません。
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        放射線検査を受ける前に、身に着けている金属、宝石、玉器などの装飾品を外してください。
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        MRI検査を受ける際には、ジュエリー、時計、ポケベル、携帯電話などの金属製品を身につけないようにしてください。磁気カードも検査室に持ち込まないでください。消磁を防ぐためです。
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li class="item">
                        <div class="left">健診後</div>
                        <div class="right">
                            <ul>
                                <li>
                                    <p>
                                        すべての検査が終了した後、必ず健康診断書を受付に提出してください。
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        医師のアドバイスを真剣に聞き、適切なタイミングで再検査を受けてください。必要に応じて、経過観察やさらなる検査・治療を行ってください。
                                    </p>
                                </li>
                                <li>
                                    <p>
                                        健康診断の結果を保存してください。次回の健康診断結果との比較に役立ち、また、医療機関を訪れる際の参考資料としても使用できます。
                                    </p>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </fieldset>
    </div>

    <el-dialog title="健康診断パッケージを購入する" :close-on-click-modal="false" v-model="dialog.visible" width="305px" center>
        <img :src="dialog.qrCode" class="qrcode" v-if="!dialog.result" />
        <div v-if="dialog.result" class="pay-success">
            <el-result icon="success" title="支払い成功" subTitle="表示された指示に従ってください"></el-result>
        </div>
        <div class="dialog-footer-style">
            <el-button type="danger" size="medium" v-if="!dialog.result" @click="closeHandle">支払いを中止する</el-button>
            <el-button type="primary" size="medium" v-if="!dialog.result" @click="successHandle">
                支払い成功
            </el-button>
            <el-button type="primary" size="medium" v-if="dialog.result" @click="closeHandle">閉じる</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, ref, type Ref, getCurrentInstance, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import router from '../../router/index';
const instance = getCurrentInstance();
const proxy: any = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
    number: 1
});

const data = reactive({
    code: null,
    title: null,
    description: null,
    image: null,
    initialPrice: null,
    currentPrice: null,
    ruleName: null,
    type: null,
    tag: [],
    checkup_1: [],
    checkup_2: [],
    checkup_3: [],
    checkup_4: [],
    count_1: null,
    count_2: null,
    count_3: null,
    count_4: null,
    checkupCount: null
});

const dialog = reactive({
    visible: false,
    result: false,
    qrCode: null,
    //订单流水号，查询付款结果时候使用
    outTradeNo: null
});

//接收路由传递的商品主键值，该页面要根据商品主键值加载商品信息
let id = router.currentRoute.value.params.id;

//滚动到页面的顶部，否则路由跳转页面之后，页面垂直位置还是上一个页面的地方
window.scrollTo(0, 0);

proxy.$http('/front/goods/searchById', 'POST', { id: id }, true, function (resp) {
    let result = resp.result;
    if (result == null) {
        proxy.$message({
            message: '商品を正しく読み込めませんでした',
            type: 'warning',
            duration: 1200,
            onClose: () => {
                router.push({ name: "FrontGoodsList" })
            }
        });
    }
    else {
        data.code = result.code;
        data.title = result.title;
        data.description = result.description;
        data.image = `${proxy.$minioUrl}/${result.image}`;
        data.initialPrice = result.initialPrice;
        data.currentPrice = result.currentPrice;
        data.ruleName = result.ruleName;
        data.type = result.type;
        data.tag = result.tag;
        data.checkup_1 = result.checkup_1;
        data.checkup_2 = result.checkup_2;
        data.checkup_3 = result.checkup_3;
        data.checkup_4 = result.checkup_4;
        data.count_1 = result.count_1;
        data.count_2 = result.count_2;
        data.count_3 = result.count_3;
        data.count_4 = result.count_4;
        data.checkupCount = result.count_1 + result.count_2 + result.count_3 + result.count_4;
    }

});

function createPayment() {
    dialog.outTradeNo = null;
    dialog.qrCode = null;
    dialog.result = false;
    //检查用户是否登录
    proxy.$http('/front/customer/checkLogin', 'GET', null, true, function (resp) {
        if (!resp.result) {
            proxy.$message({
                message: '先にシステムにログインしてください',
                type: 'warning',
                duration: 1200
            });
        }
        else {
            proxy.$confirm('この健康診断パッケージを購入しますか？', '通知情報', {
                confirmButtonText: '確認する',
                cancelButtonText: '中止する',
                type: 'info'
            }).then(() => {
                let json = { goodsId: id, number: dataForm.number };
                proxy.$http('/front/order/createPayment', 'POST', json, true, function (resp) {
                    if (!resp.illegal) {
                        dialog.visible = true;
                        let result = resp.result;
                        dialog.outTradeNo = result.outTradeNo;
                        dialog.qrCode = result.qrCodeBase64;

                        //利用WebSocket接受后端推送的付款结果(这里是新添加的代码)
                        let token = localStorage.getItem('token');

                        proxy.$options.sockets.onmessage = function (resp) {
                            let data = resp.data;
                            let json = JSON.parse(data);
                            if (json.result) {
                                dialog.result = true;
                                //删除消息监听
                                delete proxy.$options.sockets.onmessage;
                            }
                        };
                        //发送消息，让后端缓存Session会话，将来才能推送消息
                        proxy.$socket.sendObj(
                            { opt: 'ping', identity: 'customer', token: token }
                        );

                    } else {
                        ElMessageBox.alert(
                            '今日、未払いの注文や返金注文が上限に達しましたので、今日はこれ以上注文できません。明日また健康診断パッケージを購入してください！',
                            '通知情報',
                            {}
                        );
                    }
                });
            });
        }
    });
}

function closeHandle() {
    dialog.visible = false;
}

function successHandle() {
    let json = { outTradeNo: dialog.outTradeNo }; 
    proxy.$http('/front/order/searchPaymentResult', 'POST', json, true, function (resp) {
        if (!resp.result) {
            proxy.$message({
                message: '支払い失敗',
                type: 'error',
                duration: 1200
            });
        } else {
            dialog.result = true;
            delete proxy.$options.sockets.onmessage;
        }
    });
}
</script>


<style lang="less" scoped>
@import url('goods.less');
</style>
