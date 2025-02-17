<template>
    <div v-if="proxy.isAuth(['ROOT', 'GOODS:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item prop="keyword">
                <el-input v-model="dataForm.keyword" placeholder="パッケージ名" maxlength="50" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item prop="code">
                <el-input v-model="dataForm.code" placeholder="パッケージ番号" class="input" maxlength="20"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-select v-model="dataForm.type" class="input" placeholder="分類" clearable="clearable">
                    <el-option label="父母体检" value="父母体检" />
                    <el-option label="入职体检" value="入职体检" />
                    <el-option label="职场白领" value="职场白领" />
                    <el-option label="个人高端" value="个人高端" />
                    <el-option label="中青年体检" value="中青年体检" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="dataForm.partId" class="input" placeholder="展示エリア" clearable="clearable">
                    <el-option label="活动专区" value="1" />
                    <el-option label="热卖套餐" value="2" />
                    <el-option label="新品推荐" value="3" />
                    <el-option label="孝敬父母" value="4" />
                    <el-option label="白领精英" value="5" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">検索</el-button>
                <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'GOODS:INSERT'])" @click="addHandle()">
                    追加
                </el-button>
                <el-button type="danger" :disabled="!proxy.isAuth(['ROOT', 'GOODS:DELETE'])" @click="deleteHandle()">
                    一括削除
                </el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
                    <el-radio-button label="すべて"></el-radio-button>
                    <el-radio-button label="販売中"></el-radio-button>
                    <el-radio-button label="販売終了"></el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
            @selection-change="selectionChangeHandle">
            <el-table-column type="selection" header-align="center" :selectable="selectable" align="center"
                width="50" />
            <el-table-column type="index" header-align="center" align="center" width="100" label="番号">
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="title" header-align="left" align="left" min-width="250" label="パッケージ名" />
            <el-table-column prop="code" header-align="left" align="left" min-width="130" label="パッケージ番号" />
            <el-table-column header-align="center" align="center" min-width="80" label="セール価格">
                <template #default="scope">
                    <span>￥{{ scope.row.currentPrice }}</span>
                </template>
            </el-table-column>
            <el-table-column header-align="center" align="center" min-width="100" label="元の価格">
                <template #default="scope">
                    <span>￥{{ scope.row.initialPrice }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="ruleName" header-align="center" align="center" min-width="100" label="販促計画" />
            <el-table-column prop="salesVolume" header-align="center" align="center" min-width="100" label="売上" />
            <el-table-column prop="type" header-align="center" align="center" min-width="100" label="分類" />
            <el-table-column header-align="center" align="center" min-width="100" label="健康診断内容">
                <template #default="scope">
                    <span :class="scope.row.hasCheckup ? 'link-blue' : 'link-red'"
                        @click="documentHandle(scope.row.id, scope.row.hasCheckup)">
                        {{ scope.row.hasCheckup ? '資料あり' : '資料無し' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="status" header-align="center" align="center" min-width="80" label="状態">
                <template #default="scope">
                    <el-switch v-model="scope.row.status" inline-prompt
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;" active-text="発売"
                        inactive-text="販売中止" :disabled="!scope.row.hasCheckup"
                        @change="changeSwitchHandle(scope.row.id, scope.row.status)" />
                </template>
            </el-table-column>
            <el-table-column header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="text" :disabled="!scope.row.status" @click="viewHandle(scope.row.id)">
                        プレビュー
                    </el-button>
                    <el-button type="text" v-if="proxy.isAuth(['ROOT', 'GOODS:UPDATE'])" :disabled="scope.row.status"
                        @click="updateHandle(scope.row.id)">
                        編集
                    </el-button>
                    <el-button type="text" v-if="proxy.isAuth(['ROOT', 'GOODS:DELETE'])"
                        :disabled="scope.row.salesVolume > 0 || scope.row.status" @click="deleteHandle(scope.row.id)">
                        削除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
            :current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
            :total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>

    <el-dialog :title="!goodsDialog.dataForm.id ? '追加' : '編集'"
        v-if="proxy.isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])" :close-on-click-modal="false"
        v-model="goodsDialog.visible" width="750px">
        <el-form :model="goodsDialog.dataForm" ref="dialogForm" :rules="goodsDialog.dataRule" label-width="140px">
            <el-form-item label="パッケージ名" prop="title">
                <el-input v-model="goodsDialog.dataForm.title" maxlength="50" clearable />
            </el-form-item>
            <el-form-item label="パッケージ番号" prop="code">
                <el-input v-model="goodsDialog.dataForm.code" maxlength="20" clearable />
            </el-form-item>
            <el-form-item label="概要情報" prop="description">
                <el-input type="textarea" v-model="goodsDialog.dataForm.description" :rows="4" maxlength="200"
                    clearable />
            </el-form-item>
            <el-form-item label="元の価格" prop="initialPrice">
                <el-input v-model="goodsDialog.dataForm.initialPrice" placeholder="元の価格を入力してください。" class="price" maxlength="20"
                    clearable>
                    <template #append>
                        元
                    </template>
                </el-input>
                <span class="desc">ご案内：価格は分単位で正確に表示（小数点以下2桁）</span>
            </el-form-item>
            <el-form-item label="セール価格" prop="currentPrice">
                <el-input v-model="goodsDialog.dataForm.currentPrice" placeholder="セール価格を入力してください。" class="price" maxlength="20"
                    clearable>
                    <template #append>
                        元
                    </template>
                </el-input>
                <span class="desc">ご案内：価格は分単位で正確に表示（小数点以下2桁）</span>
            </el-form-item>
            <el-form-item label="割引リスト">
                <el-select v-model="goodsDialog.dataForm.ruleId" placeholder="割引を選択する" clearable="clearable">
                    <el-option :label="one.name" :value="one.id" v-for="one in goodsDialog.ruleList" />
                </el-select>
            </el-form-item>
            <el-form-item label="カバー画像" prop="image">
                <el-upload class="image-uploader" :action="goodsDialog.upload.action"
                    :headers="goodsDialog.upload.headers" :data="goodsDialog.upload.data" :show-file-list="false"
                    accept=".jpg,.jpeg" :on-success="imageUploadSuccess" :before-upload="imageBeforeUpload"
                    :on-error="imageUploadError">
                    <img v-if="goodsDialog.imageUrl" :src="goodsDialog.imageUrl" class="image" />
                    <el-icon v-else class="image-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item label="パッケージ種類" prop="type">
                <el-select v-model="goodsDialog.dataForm.type" placeholder="検査の種類" clearable="clearable">
                    <el-option label="父母体检" value="父母体检" />
                    <el-option label="入职体检" value="入职体检" />
                    <el-option label="职场白领" value="职场白领" />
                    <el-option label="个人高端" value="个人高端" />
                    <el-option label="中青年体检" value="中青年体检" />
                </el-select>
            </el-form-item>
            <el-form-item label="特性ラベル">
                <div class="tag-row">
                    <el-input class="tag-input" v-model="goodsDialog.newTag" @keyup.enter="enterTag" clearable />
                    <span class="desc">ご案内：タグを入力後、Enterキーを押してください</span>
                </div>
                <div class="tags">
                    <el-tag v-for="one in goodsDialog.dataForm.tag" closable :disable-transitions="false"
                        @close="closeTag(one)">
                        {{ one }}
                    </el-tag>
                </div>
            </el-form-item>
            <el-form-item label="展示エリア" prop="partId">
                <el-select v-model="goodsDialog.dataForm.partId" placeholder="展示エリアを選択する" clearable="clearable">
                    <el-option label="活动专区" value="1" />
                    <el-option label="热卖套餐" value="2" />
                    <el-option label="新品推荐" value="3" />
                    <el-option label="孝敬父母" value="4" />
                    <el-option label="白领精英" value="5" />
                </el-select>
            </el-form-item>
            <el-form-item label="体检内容">
                <el-row :gutter="10" class="item-row" v-for="(one, $index) in goodsDialog.item" :key="$index">
                    {{ i }}
                    <el-col :span="6">
                        <el-select v-model="one.type" placeholder="検査の種類" clearable="clearable">
                            <el-option label="科室检查" value="科室检查" />
                            <el-option label="实验室检查" value="实验室检查" />
                            <el-option label="医技检查" value="医技检查" />
                            <el-option label="其他检查" value="其他检查" />
                        </el-select>
                    </el-col>
                    <el-col :span="6">
                        <el-input v-model="one.title" placeholder="検査項目" maxlength="50" clearable />
                    </el-col>
                    <el-col :span="11">
                        <el-input v-model="one.content" placeholder="検査内容" maxlength="500" clearable />
                    </el-col>
                    <el-col :span="1">
                        <el-button type="primary" :icon="Delete" @click="deleteItem($index)" />
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="danger" @click="addItem">項目を追加</el-button>
                <el-button @click="goodsDialog.visible = false">中止する</el-button>
                <el-button type="primary" @click="dataFormSubmit">確認する</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog title="提示情報" v-if="proxy.isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])"
        v-model="documentDialog.visible" width="350px">
        <div class="message-content">
            <el-icon :size="18" class="icon">
                <WarningFilled />
            </el-icon>
            <p>【アップロード】または【ダウンロード】で健康診断内容の文書を選択してください。もし健康診断内容の文書をアップロードしていない場合、健康診断セットは公開できません。</p>
        </div>
        <template #footer>
            <span class="document-dialog-footer">
                <el-upload :action="documentDialog.upload.action" :data="documentDialog.data" :show-file-list="false"
                    :headers="documentDialog.upload.headers" accept=".xlsx" :before-upload="documentBeforeUpload"
                    :on-success="documentUploadSuccess" :on-error="documentUploadError">
                    <el-button type="success" :icon="Upload" class="uploadBtn">アップロード</el-button>
                </el-upload>
                <el-button type="primary" :icon="Download" class="downloadBtn"
                    :disabled="!documentDialog.data.hasCheckup" @click="documentDownloadHandle">
                    ダウンロード
                </el-button>
            </span>
        </template>
    </el-dialog>

</template>

<script lang="ts" setup>
import { reactive, getCurrentInstance, ref, onMounted } from 'vue';
//引入ElementPlus组件库中的三个图标，要给按钮设置图标
import { Delete, Download, Upload } from '@element-plus/icons-vue';
import router from '../../router/index';
import type { UploadFile, UploadFiles } from 'element-plus';
const instance = getCurrentInstance();
const proxy: any = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
    keyword: null,
    code: null,
    type: null,
    partId: null,
    statusLabel: 'すべて',
    status: null
});

const dataRule = reactive({
    keyword: [{ pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: 'キーワードの内容が正しくありません' }],
    code: [{ min: 6, message: '番号は6文字以上でなければなりません' }, { pattern: '^[a-zA-Z0-9]{6,20}$', message: '番号の形式が誤っています' }]
});

const data = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false,
    selections: []
});

const goodsDialog = reactive({
    visible: false,
    newTag: null,
    item: [{}],
    imageUrl: null,
    checkup: null,
    ruleList: [],
    dataForm: {
        id: null,
        title: null,
        code: null,
        description: null,
        initialPrice: null,
        currentPrice: null,
        ruleId: null,
        image: null,
        type: null,
        tag: [],
        partId: null
    },
    upload: {
        action: `${proxy.$baseUrl}/mis/goods/uploadImage`,
        headers: {
            token: localStorage.getItem('token')
        },
        data: {
            id: null
        },
    },

    dataRule: {
        title: [
            { required: true, message: '氏名を入力してください。' },
            { min: 2, message: '氏名は2文字以上でなければなりません' },
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,50}$', message: '氏名の形式が誤っています' }
        ],
        code: [
            { required: true, message: '番号を入力してください。' },
            { min: 6, message: '番号は６文字以上でなければなりません' },
            { pattern: '^[a-zA-Z0-9]{6,20}$', message: '番号の形式が誤っています' }
        ],
        description: [{ required: true, message: '概要情報を入力してください。' }],
        initialPrice: [
            {
                required: true,
                message: '価格を入力してください。'
            },
            {
                pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
                message: '価格の形式が誤っています'
            }
        ],
        currentPrice: [
            {
                required: true,
                message: '価格を入力してください。'
            },
            {
                pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
                message: '価格の形式が誤っています'
            }
        ],
        image: [
            {
                required: true,
                message: '表紙画像がアップロードされていません'
            }
        ],
        type: [
            {
                required: true,
                message: 'パッケージの種類を選択していません'
            }
        ]
    }
});

const documentDialog = reactive({
    visible: false,
    upload: {
        action: `${proxy.$baseUrl}/mis/goods/uploadCheckupExcel`,
        headers: {
            token: localStorage.getItem('token')
        }
    },
    data: {
        id: null,
        hasCheckup: null
    }
});

function loadDataList() {
    data.loading = true;
    if (dataForm.statusLabel == 'すべて') {
        dataForm.status = null;
    } else if (dataForm.statusLabel == '販売中') {
        dataForm.status = true;
    } else {
        dataForm.status = false;
    }
    let json = {
        page: data.pageIndex,
        length: data.pageSize,
        keyword: dataForm.keyword,
        code: dataForm.code,
        type: dataForm.type,
        partId: dataForm.partId,
        status: dataForm.status
    };
    proxy.$http('/mis/goods/searchByPage', 'POST', json, true, function (resp) {
        let page = resp.page;
        let list = page.list;
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
            if (dataForm.type == '') {
                dataForm.type = null;
            }
            if (dataForm.partId == '') {
                dataForm.partId = null;
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

function imageBeforeUpload(file) {
    let size = file.size / 1024 / 1024;
    if (size > 2) {
        proxy.$message({
            message: '画像は2MBを超えてはいけません',
            type: 'error',
            duration: 1200
        });
        return false;
    }
    return true;
}

function imageUploadSuccess(resp: any, uploadFile: UploadFile, uploadFiles: UploadFiles) {
    if (resp.msg == 'success') {
        let path = resp.result;
        //保存图片相对地址，添加或者修改商品的时候，要上传给后端Web方法
        goodsDialog.dataForm.image = path;
        //上传控件中显示已上传的图片
        goodsDialog.imageUrl = `${proxy.$minioUrl}/${path}`;
    }
}

function imageUploadError(e) {
    proxy.$message({
        message: "画像のアップロードに失敗しました",
        type: 'error',
        duration: 1200
    });
    console.error(e)
}

function addHandle() {
    //添加新商品id和上传图片相关属性都应该置空
    goodsDialog.dataForm.id = null;
    goodsDialog.dataForm.image = null;
    goodsDialog.imageUrl = null;

    //规则列表相关的属性也要置空
    goodsDialog.dataForm.ruleId = null;
    goodsDialog.ruleList = [];

    //体检内容数组也要置空
    goodsDialog.item = [{}];

    //计算体检内容用于充当临时变量的属性也置空（该变量下面会用到）
    goodsDialog.checkup = null;

    //跟tag标签有关的属性也都重新赋值
    goodsDialog.newTag = null;
    goodsDialog.dataForm.tag = [];

    goodsDialog.visible = true;

    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
        //加载规则列表
        loadAllRule();
    });
}

function loadAllRule() {
    proxy.$http('/mis/rule/searchAllRule', 'GET', null, true, function (resp) {
        goodsDialog.ruleList = resp.result;
    });
}

function enterTag() {
    //判断文本框输入的内容是不是空值或者空字符串
    if (goodsDialog.newTag != null && goodsDialog.newTag != '') {
        //判断newTag数组是否有文本框输入的内容相同的元素，如果有就不需要创建新的Tag控件
        if (goodsDialog.dataForm.tag.includes(goodsDialog.newTag)) {
            proxy.$message({
                message: '重複したタグを追加できません',
                type: 'warning',
                duration: 1200
            });
        } else {
            goodsDialog.dataForm.tag.push(goodsDialog.newTag);
            //清空文本框内容
            goodsDialog.newTag = null;
        }
    }
}

function closeTag(tag) {
    //计算要关闭的Tag是数组中的哪个元素
    let i = goodsDialog.dataForm.tag.indexOf(tag);
    //删除数组中某个元素
    goodsDialog.dataForm.tag.splice(i, 1);
}

function addItem() {
    goodsDialog.item.push({});
}

function deleteItem(index) {
    if (goodsDialog.item.length == 1) {
        proxy.$message({
            message: '唯一残っている健康診断内容を削除できません',
            type: 'warning',
            duration: 1200
        });
    } else {
        goodsDialog.item.splice(index, 1);
    }
}

function dataFormSubmit() {
    proxy.$refs['dialogForm'].validate(valid => {
        if (valid) {
            let temp = {};
            //遍历每个栅格行
            for (let one of goodsDialog.item) {
                //判断栅格行中的列表有没有选中的选项
                if (one.type == undefined || one.type == '') {
                    proxy.$message({
                        message: '検査の種類を選択していません',
                        type: 'warning',
                        duration: 1200
                    });
                    return;
                }
                //判断栅格行中的第一个文本框有没有填写内容
                if (one.title == undefined || one.title == '') {
                    proxy.$message({
                        message: '記入されていない健康診断項目があります',
                        type: 'warning',
                        duration: 1200
                    });
                    return;
                }
                //判断栅格行中的第二个文本框有没有填写内容
                if (one.content == undefined || one.content == '') {
                    proxy.$message({
                        message: '記入されていない健康診断内容があります',
                        type: 'warning',
                        duration: 1200
                    });
                    return;
                }

                //定义列表项与checkup之间的对应关系
                let typeJson = {
                    科室检查: 'checkup_1',
                    实验室检查: 'checkup_2',
                    医技检查: 'checkup_3',
                    其他检查: 'checkup_4'
                };
                //根据栅格行中选中的列表项，判断该行体检内容对应哪个checkup
                let type = typeJson[one.type];
                //判断temp中是否含有某个checkup属性
                if (!temp.hasOwnProperty(type)) {
                    //给JSON对象添加某个checkup属性
                    temp[type] = [{ title: one.title, content: one.content }];
                } else {
                    //向JSON对象中某个checkup属性添加元素
                    temp[type].push({ title: one.title, content: one.content });
                }
            }
            //检查JSON对象中是否包含checkup_1到checkup_4这四个属性，缺哪个就添加哪个属性
            ['checkup_1', 'checkup_2', 'checkup_3', 'checkup_4'].forEach(function (one) {
                if (!temp.hasOwnProperty(one)) {
                    temp[one] = null;
                }
            });

            goodsDialog.checkup = temp;

            let tag = goodsDialog.dataForm.tag;
            let json = {
                id: goodsDialog.dataForm.id,
                title: goodsDialog.dataForm.title,
                code: goodsDialog.dataForm.code,
                description: goodsDialog.dataForm.description,
                checkup_1: goodsDialog.checkup.checkup_1,
                checkup_2: goodsDialog.checkup.checkup_2,
                checkup_3: goodsDialog.checkup.checkup_3,
                checkup_4: goodsDialog.checkup.checkup_4,
                initialPrice: goodsDialog.dataForm.initialPrice,
                currentPrice: goodsDialog.dataForm.currentPrice,
                ruleId: goodsDialog.dataForm.ruleId == '' ? null : goodsDialog.dataForm.ruleId,
                image: goodsDialog.dataForm.image,
                type: goodsDialog.dataForm.type,
                partId: goodsDialog.dataForm.partId,

                tag: tag != null && tag.length > 0 ? tag : null
            };

            proxy.$http(
                `/mis/goods/${goodsDialog.dataForm.id == null ? 'insert' : 'update'}`,
                'POST',
                json,
                true,
                function (resp) {
                    if (resp.rows == 1) {
                        proxy.$message({
                            message: '操作に成功しました。	',
                            type: 'success',
                            duration: 1200
                        });
                        goodsDialog.visible = false;
                        loadDataList();
                    } else {
                        proxy.$message({
                            message: '操作に失敗しました。',
                            type: 'error',
                            duration: 1200
                        });
                    }
                }
            );
        }
    });
}

function updateHandle(id) {
    goodsDialog.upload.data.id = id
    goodsDialog.dataForm.id = id;
    goodsDialog.dataForm.image = null;
    goodsDialog.imageUrl = null;
    goodsDialog.item = [];
    goodsDialog.checkup = null;
    goodsDialog.newTag = null;
    goodsDialog.dataForm.tag = [];
    goodsDialog.visible = true;

    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
        let json = { id: id };
        loadAllRule();
        proxy.$http('/mis/goods/searchById', 'POST', json, true, function (resp) {
            let result = resp.result;
            goodsDialog.dataForm.code = resp.result.code;
            goodsDialog.dataForm.title = resp.result.title;
            goodsDialog.dataForm.description = resp.result.description;

            goodsDialog.dataForm.image = resp.result.image;
            goodsDialog.imageUrl = `${proxy.$minioUrl}/${resp.result.image}`;

            goodsDialog.dataForm.initialPrice = resp.result.initialPrice;
            goodsDialog.dataForm.currentPrice = resp.result.currentPrice;
            goodsDialog.dataForm.type = resp.result.type;
            goodsDialog.dataForm.tag = resp.result.hasOwnProperty('tag') ? resp.result.tag : [];
            goodsDialog.dataForm.partId = resp.result.partId + "";
            goodsDialog.dataForm.ruleId = resp.result.ruleId;
            let typeJson = {
                checkup_1: '科室检查',
                checkup_2: '实验室检查',
                checkup_3: '医技检查',
                checkup_4: '其他检查'
            };
            for (let key in typeJson) {
                if (resp.result.hasOwnProperty(key)) {
                    let checkup = resp.result[key];
                    for (let one of checkup) {
                        goodsDialog.item.push({ type: typeJson[key], title: one.title, content: one.content });
                    }
                }
            }
        });
    });
}

function documentHandle(id, hasCheckup) {
    documentDialog.data = {
        id: id,
        hasCheckup: hasCheckup
    };
    documentDialog.visible = true;
}

function documentBeforeUpload(file) {
    let size = file.size / 1024 / 1024;
    if (size > 20) {
        proxy.$message({
            message: 'ファイルは20MBを超えてはいけません',
            type: 'error',
            duration: 1200
        });
        return false;
    }
    return true;
}

function documentUploadSuccess() {
    documentDialog.visible = false;
    proxy.$message({
        message: 'アップロードに成功しました',
        type: 'success',
        duration: 1200,
        onClose: () => {
            loadDataList()
        }
    });
}

function documentUploadError(e) {
    proxy.$message({
        message: "アップロードに失敗しました",
        type: 'error',
        duration: 1200
    });
    console.error(e);
}

function documentDownloadHandle() {
    let token = localStorage.getItem('token')
    let id = documentDialog.data.id
    let url = `${proxy.$baseUrl}/mis/goods/downloadCheckupExcel?token=${token}&id=${id}`;
    //创建超链接对象
    let a = document.createElement('a');
    //设置超链接地址
    a.href = url;
    //利用超链接发出GET请求
    a.click();
    //1秒钟后关闭弹窗控件
    setTimeout(function () {
        documentDialog.visible = false;
    }, 1000);
}

function changeSwitchHandle(id, bool) {
    let json = {
        id: id,
        status: bool
    };
    proxy.$http('/mis/goods/updateStatus', 'POST', json, true, function (resp) {
        if (resp.result) {
            proxy.$message({
                message: '操作に成功しました。',
                type: 'success',
                duration: 1200
            });
        }
    });
}

function selectable(row, index) {
    if (row.salesVolume > 0 || row.status == true) {
        return false;
    }
    return true;
}

function selectionChangeHandle(val) {
    data.selections = val;
}

function deleteHandle(id) {
    let ids = id ? [id] : data.selections.map(item => {
        return item.id;
    });
    if (ids.length == 0) {
        proxy.$message({
            message: '選択した記録がありません',
            type: 'warning',
            duration: 1200
        });
    } else {
        proxy.$confirm(`選択した記録を削除してもよろしいですか？`, '提示', {
            confirmButtonText: '確認する',
            cancelButtonText: '中止する',
            type: 'warning'
        }).then(() => {
            let json = { ids: ids };
            proxy.$http('/mis/goods/deleteByIds', 'POST', json, true, function (resp) {
                if (resp.rows > 0) {
                    proxy.$message({
                        message: `${resp.rows}件の記録を削除しました`,
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
}

function viewHandle(id) {
    router.push({
        name: 'FrontGoods',
        params: {
            id: id
        }
    });
}
</script>


<style lang="less" scoped>
@import url('goods.less');
</style>
