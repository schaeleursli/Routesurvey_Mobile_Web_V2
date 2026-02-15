import axios from "axios";
import Cookies from "js-cookie";

class ShareCenterController {
  async generateReportRouteShare(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;
      data.UserId = uid;

      const res = await axios.post(
        "ShareCenter/GenerateReportRouteShare",
        data
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async generateRouteRouteShare(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;
      data.UserId = uid;

      const res = await axios.post("ShareCenter/GenerateRouteRouteShare", data);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async generateDataRouteShare(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;
      data.UserId = uid;

      const res = await axios.post("ShareCenter/GenerateDataRouteShare", data);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async generatePhotosRouteShare(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;
      data.UserId = uid;

      const res = await axios.post(
        "ShareCenter/GeneratePhotosRouteShare",
        data
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async generateMapRouteShare(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;
      data.UserId = uid;

      const res = await axios.post("ShareCenter/GenerateMapRouteShare", data);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getReportRouteShareById(id) {
    try {
      const res = await axios.get(`ShareCenter/GetReportRouteShareById/${id}`);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getRouteRouteShareById(id) {
    try {
      const res = await axios.get(`ShareCenter/GetRouteRouteShareById/${id}`);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getDataRouteShareById(id) {
    try {
      const res = await axios.get(`ShareCenter/GetDataRouteShareById/${id}`);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getMapRouteShareById(id) {
    try {
      const res = await axios.get(`ShareCenter/GetMapRouteShareById/${id}`);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getPhotosRouteShareById(id) {
    try {
      const res = await axios.get(`ShareCenter/GetPhotosRouteShareById/${id}`);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getReportRouteShareFromUrl(url) {
    try {
      const res = await axios.post(`ShareCenter/GetReportRouteShareFromUrl`, {
        Url: url,
      });
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
          isExpired: res.data.isExpired,
          reportGeneration: res.data.reportGeneration,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getRouteRouteShareFromUrl(url) {
    try {
      const res = await axios.post(`ShareCenter/GetRouteRouteShareFromUrl`, {
        Url: url,
      });
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
          isExpired: res.data.isExpired,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getPhotosRouteShareFromUrl(url) {
    try {
      const res = await axios.post(`ShareCenter/GetPhotosRouteShareFromUrl`, {
        Url: url,
      });
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
          isExpired: res.data.isExpired,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getMapRouteShareFromUrl(url) {
    try {
      const res = await axios.post(`ShareCenter/GetMapRouteShareFromUrl`, {
        Url: url,
      });
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
          isExpired: res.data.isExpired,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getDataRouteShareFromUrl(url) {
    try {
      const res = await axios.post(`ShareCenter/GetDataRouteShareFromUrl`, {
        Url: url,
      });
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
          isExpired: res.data.isExpired,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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
  async getMapRouteShares(routeId) {
    try {
      const res = await axios.get(`ShareCenter/GetMapRouteShares/${routeId}`);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getPhotosRouteShares(routeId) {
    try {
      const res = await axios.get(
        `ShareCenter/GetPhotosRouteShares/${routeId}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getReportRouteShares(routeId) {
    try {
      const res = await axios.get(
        `ShareCenter/GetReportRouteShares/${routeId}`
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
        };
      }

      return {
        result: false,
        message: String(error),
      };
    } catch (error) {
      console.log(error);
      return {
        result: false,
        message: String(error),
      };
    }
  }

  async getRouteRouteShares(routeId) {
    try {
      const res = await axios.get(`ShareCenter/GetRouteRouteShares/${routeId}`);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async getDataRouteShares(routeId) {
    try {
      const res = await axios.get(`ShareCenter/GetDataRouteShares/${routeId}`);
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
          data: res.data.data,
          route: res.data.route,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async deleteMapRouteShare(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `ShareCenter/DeleteMapRouteShare/${id}/${uid}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async deleteRouteRouteShare(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `ShareCenter/DeleteRouteRouteShare/${id}/${uid}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async deleteDataRouteShare(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `ShareCenter/DeleteDataRouteShare/${id}/${uid}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async deletePhotosRouteShare(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `ShareCenter/DeletePhotosRouteShare/${id}/${uid}`
      );

      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async deleteReportRouteShare(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `ShareCenter/DeleteReportRouteShare/${id}/${uid}`
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async incrementMapRouteShareView(shareId) {
    try {
      const res = await axios.get(
        `ShareCenter/IncrementMapRouteShareView/${shareId}`
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async incrementRouteRouteShareView(shareId) {
    try {
      const res = await axios.get(
        `ShareCenter/IncrementRouteRouteShareView/${shareId}`
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async incrementReportRouteShareView(shareId) {
    try {
      const res = await axios.get(
        `ShareCenter/IncrementReportRouteShareView/${shareId}`
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async incrementDataRouteShareView(shareId) {
    try {
      const res = await axios.get(
        `ShareCenter/IncrementDataRouteShareView/${shareId}`
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async incrementPhotosRouteShareView(shareId) {
    try {
      const res = await axios.get(
        `ShareCenter/IncrementPhotosRouteShareView/${shareId}`
      );
      if (res.data.result) {
        return {
          result: true,
          message: res.data.message,
        };
      } else {
        return {
          result: false,
          message: res.data.message,
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

  async generateZipFromUrls(data) {
    try {
      const res = await axios.post(`ShareCenter/GenerateZipFromUrls`, data, {
        responseType: "blob",
      });

      if (res.status === 200) {
        // Create a blob URL for the file
        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element to trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = data.ZipFileName || "shared_files.zip"; // Default filename
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return {
          result: true,
          message: "File downloaded successfully",
        };
      } else {
        return {
          result: false,
          message: "Failed to download file",
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

export default new ShareCenterController();
