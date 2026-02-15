import axios from "axios";
import Cookies from "js-cookie";

class UsersAdminController {
  async addUser(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("UsersAdmin/AddUser", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async updateUser(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("UsersAdmin/UpdateUser", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async changeUserPassword(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("UsersAdmin/ChangeUserPassword", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async freezeUser(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("UsersAdmin/FreezeUser", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async unfreezeUser(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("UsersAdmin/UnfreezeUser", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getUser(id) {
    try {
      const res = await axios.get(`UsersAdmin/GetUser/${id}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getUsers() {
    try {
      const res = await axios.get("UsersAdmin/GetUsers");

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async switchUserPlan(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("UsersAdmin/SwitchUserPlan", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async deleteUser(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`UsersAdmin/DeleteUser/${id}/${uid}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async cancelUserPlan(userId) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        "UsersAdmin/CancelUserPlan/" + Number(userId) + "/" + uid
      );

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          data: res.data.data,
        };
      } else {
        return {
          result: false,
          message: String(res.data.message),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }
}

export default new UsersAdminController();
