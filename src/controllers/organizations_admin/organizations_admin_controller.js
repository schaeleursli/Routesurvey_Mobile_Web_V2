import axios from "axios";
import Cookies from "js-cookie";

class OrganizationsAdminController {
  async addOrganization(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post("OrganizationsAdmin/AddOrganization", data);

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

  async updateOrganization(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/UpdateOrganization",
        data
      );

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

  async deleteOrganization(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `OrganizationsAdmin/DeleteOrganization/${id}/${uid}`
      );

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

  async getOrganization(id) {
    try {
      const res = await axios.get(`OrganizationsAdmin/GetOrganization/${id}`);

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

  async getOrganizations() {
    try {
      const res = await axios.get("OrganizationsAdmin/GetOrganizations");

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

  async assignUserToOrganization(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/AssignUserToOrganization",
        data
      );

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

  async unassignUserFromOrganization(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/UnassignUserFromOrganization",
        data
      );

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

  async getOrganizationUsers(organizationId) {
    try {
      const res = await axios.get(
        `OrganizationsAdmin/GetOrganizationUsers/${organizationId}`
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

  async getOrganizationManagers(organizationId) {
    try {
      const res = await axios.get(
        `OrganizationsAdmin/GetOrganizationManagers/${organizationId}`
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

  async getOrganizationAdmin(organizationId) {
    try {
      const res = await axios.get(
        `OrganizationsAdmin/GetOrganizationAdmin/${organizationId}`
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

  async getManagerUsers(managerId) {
    try {
      const res = await axios.get(
        `OrganizationsAdmin/GetManagerUsers/${managerId}`
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

  async getUserManager(userId) {
    try {
      const res = await axios.get(
        `OrganizationsAdmin/GetUserManager/${userId}`
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

  async getManagerOrganization(managerId) {
    try {
      const res = await axios.get(
        `OrganizationsAdmin/GetManagerOrganization/${managerId}`
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

  async getAdminOrganization(adminId) {
    try {
      const res = await axios.get(
        `OrganizationsAdmin/GetAdminOrganization/${adminId}`
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

  async getUserOrganization(userId) {
    try {
      const res = await axios.get(
        `OrganizationsAdmin/GetUserOrganization/${userId}`
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

  async getCurrentUserOrganization() {
    try {
      const userId = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `OrganizationsAdmin/GetUserOrganization/${userId}`
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

  async addOrganizationAdmin(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/AddOrganizationAdmin",
        data
      );

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

  async addOrganizationManager(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/AddOrganizationManager",
        data
      );

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

  async addOrganizationUser(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/AddOrganizationUser",
        data
      );

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

  async assignUserToManager(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        "OrganizationsAdmin/AssignUserToManager/" +
        data.UserId +
        "/" +
        data.ManagerId +
        "/" +
        uid
      );
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

  async removeUserFromOrganization(organizationId, userId) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.post(
        "OrganizationsAdmin/RemoveUserFromOrganization",
        {
          OrganizationId: organizationId,
          UserId: userId,
          ActionBy: uid,
        }
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

  async updateOrganizationUser(userData) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      userData.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/UpdateOrganizationUser",
        userData
      );

      // console.log(res);

      if (res.data.result) {
        return {
          result: true,
          message: String(res.data.message),
          // data: res.data.data,
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

  async changeUserRole(userId, newRole) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.post("OrganizationsAdmin/ChangeUserRole", {
        UserId: userId,
        NewRole: newRole,
        ActionBy: uid,
      });

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

  async updateOrganizationAdmin(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/UpdateOrganizationAdmin",
        data
      );

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

  async deleteOrganizationAdmin(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `OrganizationsAdmin/DeleteOrganizationAdmin/${id}/${uid}`
      );

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

  async updateOrganizationManager(data) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      data.ActionBy = uid;

      const res = await axios.post(
        "OrganizationsAdmin/UpdateOrganizationManager",
        data
      );

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

  async deleteOrganizationManager(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `OrganizationsAdmin/DeleteOrganizationManager/${id}/${uid}`
      );

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

  // async updateOrganizationUser(data) {
  //   try {
  //     const uid = Number(Cookies.get("login_user_id"));

  //     data.ActionBy = uid;

  //     const res = await axios.post(
  //       "OrganizationsAdmin/UpdateOrganizationUser",
  //       data
  //     );

  //     if (res.data.result) {
  //       return {
  //         result: true,
  //         message: String(res.data.message),
  //       };
  //     } else {
  //       return {
  //         result: false,
  //         message: String(res.data.message),
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       result: false,
  //       message: String(error),
  //     };
  //   }
  // }

  async deleteOrganizationUser(id) {
    try {
      const uid = Number(Cookies.get("login_user_id"));

      const res = await axios.get(
        `OrganizationsAdmin/DeleteOrganizationUser/${id}/${uid}`
      );

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

  async freezeOrganizationUser(data) {
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

  async unfreezeOrganizationUser(data) {
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

  async getSubscriptionPlans() {
    try {
      const res = await axios.get("Subscription/GetSubscriptionPlans");

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
export default new OrganizationsAdminController();
