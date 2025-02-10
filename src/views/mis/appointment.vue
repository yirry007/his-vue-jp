<template>
    <div v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])">
        <el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
            <el-form-item>
                <el-date-picker v-model="dataForm.date" type="date" placeholder="日付を選択する" :editable="false"
                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" clearable />
            </el-form-item>
            <el-form-item prop="name">
                <el-input v-model="dataForm.name" placeholder="氏名" maxlength="10" class="input" clearable />
            </el-form-item>
            <el-form-item prop="tel">
                <el-input v-model="dataForm.tel" placeholder="電話番号" maxlength="11" class="input" clearable />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchHandle()">検索</el-button>
                <el-button type="danger" :disabled="!proxy.isAuth(['ROOT', 'APPOINTMENT:DELETE'])"
                    @click="deleteHandle()">
                    一括削除
                </el-button>
            </el-form-item>
            <el-form-item class="mold">
                <el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
                    <el-radio-button label="すべて"></el-radio-button>
                    <el-radio-button label="未記入"></el-radio-button>
                    <el-radio-button label="記入済み"></el-radio-button>
                    <el-radio-button label="終了"></el-radio-button>
                    <el-radio-button label="閉じました"></el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-table :data="data.dataList" :header-cell-style="{ 'background': '#f5f7fa' }" border v-loading="data.loading"
            @selection-change="selectionChangeHandle">
            <el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"
                fixed />
            <el-table-column type="index" header-align="center" align="center" width="120" label="番号" fixed>
                <template #default="scope">
                    <span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" header-align="center" align="center" label="氏名" width="200" fixed />
            <el-table-column prop="sex" header-align="center" align="center" label="性别" width="100" />
            <el-table-column prop="age" header-align="center" align="center" label="年齢" width="100" />
            <el-table-column prop="tel" header-align="center" align="center" label="電話番号" width="150" />
            <el-table-column prop="pid" header-align="center" align="center" label="身分証番号" width="190" />
            <el-table-column prop="company" header-align="center" align="center" label="会社名" width="200" />
            <el-table-column prop="title" header-align="center" align="center" label="健診パッケージ" min-width="200" />
            <el-table-column prop="status" header-align="center" align="center" label="状態" width="120" />
            <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
                <template #default="scope">
                    <el-button type="text"
                        :disabled="!proxy.isAuth(['ROOT', 'APPOINTMENT:DELETE']) || scope.row.status != '未記入'"
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
</template>

<script setup lang="ts">
import { reactive, getCurrentInstance, ref } from 'vue';
import { dayjs } from 'element-plus';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const instance = getCurrentInstance();
const proxy = instance?.proxy; // 安全访问 proxy

const dataForm = reactive({
    name: null,
    tel: null,
    date: null,
    statusLabel: 'すべて',
    status: null
});

const dataRule = reactive({
    name: [
        { pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '氏名の形式が誤っています' }
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
    selections: []
});

function loadDataList() {
    data.loading = true;
    if (dataForm.statusLabel == 'すべて') {
        dataForm.status = null;
    } else if (dataForm.statusLabel == '未記入') {
        dataForm.status = 1;
    } else if (dataForm.statusLabel == '記入済み') {
        dataForm.status = 2;
    } else if (dataForm.statusLabel == '終了') {
        dataForm.status = 3;
    } else if (dataForm.statusLabel == '閉じました') {
        dataForm.status = 4;
    }

    let json = {
        name: dataForm.name,
        tel: dataForm.tel,
        date: dataForm.date,
        status: dataForm.status,
        page: data.pageIndex,
        length: data.pageSize
    };

    proxy.$http('/mis/appointment/searchByPage', 'POST', json, true, function (resp: any) {
        let page = resp.page;
        let statusEnum = {
            '1': '未記入',
            '2': '記入済み',
            '3': '終了',
            '4': '閉じました'
        };
        for (let one of page.list) {
            one.status = statusEnum[one.status];
        }
        data.dataList = page.list;
        data.totalCount = page.totalCount;
        data.loading = false;
    });
}

loadDataList();

function searchHandle() {
    proxy.$refs['form'].validate(valid => {
        if (valid) {
            proxy.$refs['form'].clearValidate();
            if (dataForm.date == '') {
                dataForm.date = null;
            }
            if (dataForm.name == '') {
                dataForm.name = null;
            }
            if (dataForm.tel == '') {
                dataForm.tel = null;
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

function selectionChangeHandle(val) {
    data.selections = val;
}

function selectable(row, index) {
    if (row.status != '未記入') {
        return false;
    }
    return true;
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
            proxy.$http('/mis/appointment/deleteByIds', 'POST', json, true, function (resp) {
                if (resp.rows > 0) {
                    proxy.$message({
                        message: '操作成功',
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

</script>

<style lang="less" scoped>
@import url("appointment.less");
</style>