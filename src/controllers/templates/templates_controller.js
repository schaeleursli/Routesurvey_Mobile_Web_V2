import axios from "axios";
import Cookies from "js-cookie";

class TemplatesController {
  async addTemplate(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("Templates/AddTemplate", data);

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

  async updateTemplate(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("Templates/UpdateTemplate", data);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
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
        message: String(res.data.message),
      };
    }
  }

  async removeTemplate(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Templates/RemoveTemplate/${id}/${uid}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
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

  async archiveTemplate(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Templates/ArchiveTemplate/${id}/${uid}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
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

  async unarchiveTemplate(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Templates/UnarchiveTemplate/${id}/${uid}`);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
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

  async getTemplate(id) {
    try {
      const res = await axios.get(`Templates/GetTemplate/${id}`);

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

  async getTemplates() {
    try {
      const res = await axios.get("Templates/GetTemplates");

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

  async getArchivedTemplates() {
    try {
      const res = await axios.get("Templates/GetArchivedTemplates");

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

  async addUserTemplate(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.post(`Templates/AddUserTemplate`, {
        UserId: uid,
        ActionBy: uid,
        ...data,
      });

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
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

  async removeUserTemplate(templateId) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.post(`Templates/RemoveUserTemplate`, {
        UserId: uid,
        TemplateId: templateId,
        ActionBy: uid,
      });

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
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

  async getUserTemplate(id) {
    try {
      const res = await axios.get(`Templates/GetUserTemplate/${id}`);

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

  async getCurrentUserTemplates() {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(`Templates/GetUserTemplates/${uid}`);

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

export default new TemplatesController();
