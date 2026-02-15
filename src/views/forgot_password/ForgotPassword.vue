<template>
    <div class="main-container" data-bs-theme="light">
        <div class="mainDiv">
            <div class="cardStyle">
                <form @submit.prevent="onReset" id="signupForm">

                    <img src="" id="signupLogo" />

                    <h2 class="formTitle">
                        Change your password
                    </h2>

                    <div class="inputDiv">
                        <label class="inputLabel" for="password">New Password</label>
                        <input type="password" id="password" name="password" required v-model="password">
                    </div>

                    <div class="inputDiv">
                        <label class="inputLabel" for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" v-model="confirmPassword">
                    </div>

                    <div class="buttonWrapper">
                        <button type="submit" id="submitButton" class="submitButton pure-button pure-button-primary">
                            <span>Continue</span>
                            <!-- <span id="loader"></span> -->
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import forgot_password_controller from "../../controllers/forgot_password/forgot_password_controller";
import { useUIStore } from "@/stores/ui";

const router = useRouter();
const uiStore = useUIStore();

const requestId = ref(null);
const requestData = ref(null);

const password = ref("");
const confirmPassword = ref("");

const onReset = async () => {
    if (password.value === "") {
        uiStore.showError("Please enter your password!!");
        return;
    }

    if (confirmPassword.value === "") {
        uiStore.showError("Confirm your password!!");
        return;
    }

    if (password.value !== confirmPassword.value) {
        uiStore.showError("Passwords don't match!!");
        return;
    }

    uiStore.startLoading();

    try {
        const res = await forgot_password_controller.resetPassword({
            RequestId: String(requestId.value),
            NewPassword: String(password.value),
        });

        if (res.result) {
            uiStore.showSuccess(res.message);

            setTimeout(() => {
                window.close();
            }, 5000);
        }
        else {
            uiStore.showError(res.message);
        }
    } catch (error) {
        console.log(error);
        uiStore.showError("Something went wrong!!");
    } finally {
        uiStore.stopLoading();
    }
}

const getRequestData = async () => {
    try {
        const res = await forgot_password_controller.getForgotPasswordRequest(requestId.value);

        if (res.result) {
            requestData.value = res.data;
        }
    } catch (error) {
        console.log(error);
    }
}

const getQueryParams = async () => {
    try {
        const queryParams = router.currentRoute.value.query;

        const request = atob(queryParams.request);

        requestId.value = request;

        await getRequestData();
    } catch (error) {
        console.log(error);
    }
}

const getData = async () => {
    uiStore.startLoading();

    try {
        await getQueryParams();
    } catch (error) {
        console.log(error);
    } finally {
        uiStore.stopLoading();
    }
}

onMounted(() => {
    getData();
})
</script>

<style scoped>
.main-container {
    padding: 2vh 2vw;
    overflow: auto;
}
</style>

<style scoped>
.mainDiv {
    display: flex;
    min-height: 100%;
    align-items: center;
    justify-content: center;

    /* background-color: #f9f9f9; */
    font-family: 'Open Sans', sans-serif;
}

.cardStyle {
    width: 500px;
    border-color: white;
    background: #fff;
    padding: 36px 0;
    border-radius: 4px;
    margin: 30px 0;
    box-shadow: 0 0 2px 0 rgb(0 0 0 / 25%);
}

#signupLogo {
    max-height: 100px;
    margin: auto;
    display: flex;
    flex-direction: column;
}

.formTitle {
    font-weight: 600;
    margin-top: 20px;
    color: #2F2D3B;
    text-align: center;
}

.inputLabel {
    font-size: 12px;
    color: #555;
    margin-bottom: 6px;
    margin-top: 24px;
}

.inputDiv {
    width: 70%;
    display: flex;
    flex-direction: column;
    margin: auto;
}

input {
    height: 40px;
    font-size: 16px;
    border-radius: 4px;
    border: none;
    border: solid 1px #ccc;
    padding: 0 11px;
    background-color: rgb(69 80 99 / 60.4%);
}

input:disabled {
    cursor: not-allowed;
    border: solid 1px #eee;
}

.buttonWrapper {
    margin-top: 40px;
}

.submitButton {
    width: 70%;
    height: 40px;
    margin: auto;
    display: block;
    color: #fff;
    background-color: #065492;
    border-color: #065492;
    text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
    box-shadow: 0 2px 0 rgb(0 0 0 / 3.5%);
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
}

.submitButton:disabled,
button[disabled] {
    border: 1px solid #ccc;
    background-color: #ccc;
    color: #666;
}

#loader {
    position: absolute;
    z-index: 1;
    margin: -2px 0 0 10px;
    border: 4px solid #f3f3f3;
    border-radius: 50%;
    border-top: 4px solid #666;
    width: 14px;
    height: 14px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>