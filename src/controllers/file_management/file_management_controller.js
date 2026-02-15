import axios from "axios";
import Cookies from "js-cookie";

class FileManagementController {
  async uploadUserPhoto(form) {
    try {
      const res = await axios.post("FileManagement/UploadUserPhoto", form);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          url: res.data.url,
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

  async uploadCompanyLogo(form) {
    try {
      const res = await axios.post("FileManagement/UploadCompanyLogo", form);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          url: res.data.url,
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

  async uploadRoutePhoto(form) {
    try {
      const res = await axios.post("FileManagement/UploadRoutePhoto", form);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          url: res.data.url,
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

  async uploadTemplatePhoto(form) {
    try {
      const res = await axios.post("FileManagement/UploadTemplatePhoto", form);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          url: res.data.url,
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

  async uploadMapScreenshot(form) {
    try {
      const res = await axios.post("FileManagement/UploadMapScreenshot", form);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          url: res.data.url,
        };
      } else {
        console.log(res.data);
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

export default new FileManagementController();
