<template>
    <div v-if="proxy.isAuth(['ROOT', 'RULE:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item prop="name">
                <el-input v-model="dataForm.name" placeholder="規則名" maxlength="20" class="input"
                    clearable="clearable" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">検索</el-button>
                <el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'RULE:INSERT'])" @click="addHandle()">
                    追加
                </el-button>
            </el-form-item>
        </el-form>

        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border
            v-loading="data.loading">
            <el-table-column type="index" header-align="center" align="center" width="100" label="序号">
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="left" align="left" min-width="150" label="規則名" />
            <el-table-column prop="remark" header-align="left" align="left" min-width="350" label="備考" />
            <el-table-column prop="count" header-align="center" align="center" min-width="80" label="関連パッケージ数" />
            <el-table-column header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="text" v-if="proxy.isAuth(['ROOT', 'RULE:UPDATE'])"
                        @click="updateHandle(scope.row.id)">
                        編集
                    </el-button>
                    <el-button type="text" :disabled="scope.row.count > 0" v-if="proxy.isAuth(['ROOT', 'RULE:DELETE'])"
                        @click="deleteHandle(scope.row.id)">
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

    <el-dialog :title="!dialog.dataForm.id ? '追加' : '編集'" v-if="proxy.isAuth(['ROOT', 'RULE:INSERT', 'RULE:UPDATE'])"
        :close-on-click-modal="false" v-model="dialog.visible" custom-class="dialog" width="500px">
        <el-form :model="dialog.dataForm" ref="dialogForm" :rules="dialog.dataRule" label-width="80px">
            <el-form-item label="規則名" prop="name">
                <el-input v-model="dialog.dataForm.name" maxlength="20" clearable />
            </el-form-item>
            <el-form-item label="規則内容" prop="rule">
                <el-input v-model="dialog.dataForm.rule" type="textarea" rows="5" clearable />
            </el-form-item>
            <el-form-item label="備考">
                <el-input v-model="dialog.dataForm.remark" type="textarea" rows="3" clearable />
            </el-form-item>
        </el-form>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialog.visible = false">中止する</el-button>
                <el-button type="primary" @click="dataFormSubmit">確認する</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, getCurrentInstance, ref, onMounted } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import router from '../../router/index';
const instance = getCurrentInstance();
const proxy: any = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
    name: null
});

const dataRule = reactive({
    name: [
        { required: false, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$', message: '規則名の形式が誤っています' }
    ]
});

const data = reactive({
    dataList: [],
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    loading: false
});

function loadDataList() {
    data.loading = true;
    let json = {
        page: data.pageIndex,
        length: data.pageSize,
        name: dataForm.name
    };
    proxy.$http('/mis/rule/searchByPage', 'POST', json, true, function (resp) {
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
            if (dataForm.name == '') {
                dataForm.name = null;
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

const dialog = reactive({
    visible: false,
    dataForm: {
        id: null,
        name: null,
        remark: null,
        rule: null
    },
    dataRule: {
        name: [
            { required: true, message: '規則名を入力してください。' },
            { pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$', message: '規則名の形式が誤っています' }
        ],
        rule: [{ required: true, trigger: 'blur', message: '規則名を入力してください。' }]
    }
});

function addHandle() {
    dialog.dataForm.id = null;
    //因为remark是非必填数据，所以需要我们自己清空
    dialog.dataForm.remark = null;
    dialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
    });
}

function dataFormSubmit() {
    proxy.$refs['dialogForm'].validate(valid => {
        if (valid) {
            proxy.$http(
                `/mis/rule/${dialog.dataForm.id == null ? 'insert' : 'update'}`,
                'POST',
                dialog.dataForm,
                true,
                function (resp) {
                    if (resp.rows == 1) {
                        proxy.$message({
                            message: '操作に成功しました。',
                            type: 'success',
                            duration: 1200,
                            onClose: () => {
                                dialog.visible = false;
                                loadDataList();
                            }
                        });

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
    dialog.dataForm.id = id;
    dialog.visible = true;
    proxy.$nextTick(() => {
        proxy.$refs['dialogForm'].resetFields();
        let json = { id: id };
        proxy.$http('/mis/rule/searchById', 'POST', json, true, function (resp) {
            let result = resp.result;
            dialog.dataForm.name = result.name;
            dialog.dataForm.rule = result.rule;
            dialog.dataForm.remark = result.remark;
        });
    });
}

function deleteHandle(id) {
    proxy.$confirm(`選択した記録を削除してもよろしいですか？`, '提示', {
        confirmButtonText: '確認する',
        cancelButtonText: '中止する',
        type: 'warning'
    }).then(() => {
        let json = { id: id };
        proxy.$http('/mis/rule/deleteById', 'POST', json, true, function (resp) {
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
</script>


<style scoped></style>