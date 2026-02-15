import { ref, inject } from "vue";
import { useI18n } from "vue-i18n";
import FileManagementController from "@/controllers/file_management/file_management_controller";
import TemplatesController from "@/controllers/templates/templates_controller";

export const useManageTemplates = () => {
  const setGlobalLoading = inject("setGlobalLoading", () => { });
  const showMessage = inject("showMessage", () => { });
  const { t } = useI18n();

  // Template lists
  const templates = ref([]);
  const filteredTemplates = ref([]);
  const myTemplates = ref([]);

  // Selected template
  const selectedId = ref(-1);
  const selectedTemplate = ref({});

  // Add Template fields
  const addName = ref("");
  const addDescription = ref("");
  const addPrice = ref(0);
  const addContent = ref("");
  const addMedia = ref([]);
  const addIsVisible = ref(true);
  const addIsDefault = ref(false);

  // Edit Template fields
  const editName = ref("");
  const editDescription = ref("");
  const editPrice = ref(0);
  const editContent = ref("");
  const editMedia = ref([]);
  const editIsVisible = ref(true);
  const editIsDefault = ref(false);

  // Setters for edit template
  const setEditTemplateIsVisible = (value) => {
    editIsVisible.value = value;
  };

  const setEditTemplateMedia = (value) => {
    editMedia.value = value;
  };

  const addToEditTemplateMedia = (value) => {
    editMedia.value.push(value);
  };

  const clearEditTemplateMedia = () => {
    editMedia.value = [];
  };

  // Setters for add template
  const setAddTemplateIsVisible = (value) => {
    addIsVisible.value = value;
  };

  const setAddTemplateMedia = (value) => {
    addMedia.value = value;
  };

  const addToAddTemplateMedia = (value) => {
    addMedia.value.push(value);
  };

  const clearAddTemplateMedia = () => {
    addMedia.value = [];
  };

  // Template selection
  const setSelectedTemplate = (value) => {
    selectedTemplate.value = value;
  };

  const setSelectedTemplateId = (id) => {
    selectedId.value = id;

    if (id !== -1) {
      const target = templates.value.find((e) => e.id === id);
      if (target) {
        editName.value = target.name;
        editDescription.value = target.description;
        editPrice.value = target.price;
        editContent.value = target.content;
        editMedia.value = JSON.parse(target.media);
        editIsVisible.value = target.isVisible;
        editIsDefault.value = target.isDefault || false;
      }
    }
  };

  // Template list management
  const setAvailableTemplates = (value) => {
    templates.value = value;
    filteredTemplates.value = value;
  };

  const addToAvailableTemplates = (value) => {
    templates.value.push(value);
    filteredTemplates.value.push(value);
  };

  const clearAvailableTemplates = () => {
    templates.value = [];
    filteredTemplates.value = [];
  };

  const setMyTemplates = (value) => {
    myTemplates.value = value;
  };

  const addToMyTemplates = (value) => {
    myTemplates.value.push(value);
  };

  const clearMyTemplates = () => {
    myTemplates.value = [];
  };

  // Validation functions
  const validateAddTemplateFields = (showMessages = true) => {
    if (!addName.value) {
      if (showMessages) {
        showMessage({ status: "error", message: t("template_name_label") });
      }
      return false;
    }

    if (!addDescription.value) {
      if (showMessages) {
        showMessage({
          status: "error",
          message: t("template_description_label"),
        });
      }
      return false;
    }

    // if (!addPrice.value) {
    //   if (showMessages) {
    //     showMessage({ status: "error", message: t("price_label") });
    //   }
    //   return false;
    // }

    if (!addContent.value) {
      if (showMessages) {
        showMessage({ status: "error", message: t("content_label") });
      }
      return false;
    }

    if (addMedia.value.length === 0) {
      if (showMessages) {
        showMessage({ status: "error", message: t("media_label") });
      }
      return false;
    }

    return true;
  };

  const validateEditTemplateFields = (showMessages = true) => {
    if (!editName.value) {
      if (showMessages) {
        showMessage({ status: "error", message: t("template_name_label") });
      }
      return false;
    }

    if (!editDescription.value) {
      if (showMessages) {
        showMessage({
          status: "error",
          message: t("template_description_label"),
        });
      }
      return false;
    }

    // if (!editPrice.value) {
    //   if (showMessages) {
    //     showMessage({ status: "error", message: t("price_label") });
    //   }
    //   return false;
    // }

    if (!editContent.value) {
      if (showMessages) {
        showMessage({ status: "error", message: t("content_label") });
      }
      return false;
    }

    if (editMedia.value.length === 0) {
      if (showMessages) {
        showMessage({ status: "error", message: t("media_label") });
      }
      return false;
    }

    return true;
  };

  // Clear functions
  const clearAddTemplateFields = () => {
    addName.value = "";
    addDescription.value = "";
    addPrice.value = 0;
    addContent.value = "";
    addMedia.value = [];
    addIsVisible.value = true;
    addIsDefault.value = false;
  };

  const clearEditTemplateFields = () => {
    editName.value = "";
    editDescription.value = "";
    editPrice.value = 0;
    editContent.value = "";
    editMedia.value = [];
    editIsVisible.value = true;
    editIsDefault.value = false;
  };

  // Template CRUD operations
  const onAddTemplate = async () => {
    if (!validateAddTemplateFields()) {
      // showMessage({ status: "error", message: t("please_fill_all_fields") });
      return false;
    }

    setGlobalLoading(true);

    try {
      const res = await TemplatesController.addTemplate({
        Name: addName.value,
        Description: addDescription.value,
        Content: addContent.value,
        Media: JSON.stringify(addMedia.value),
        IsVisible: addIsVisible.value,
        IsDefault: addIsDefault.value,
        Price: parseFloat(addPrice.value),
        ActionBy: -1,
      });

      if (res.result) {
        await loadTemplates();
        showMessage({
          status: "success",
          message: t("added_successfully_label"),
        });
        clearAddTemplateFields();

        return true;
      } else {
        showMessage({ status: "error", message: res.message });
      }
    } catch (error) {
      console.log(error);
      showMessage({ status: "error", message: error.toString() });
    } finally {
      setGlobalLoading(false);
    }

    return false;
  };

  const onEditTemplate = async () => {
    if (!validateEditTemplateFields()) {
      // showMessage({ status: "error", message: t("please_fill_all_fields") });
      return false;
    }

    setGlobalLoading(true);

    try {
      const res = await TemplatesController.updateTemplate({
        Id: selectedId.value,
        Name: editName.value,
        Description: editDescription.value,
        Content: editContent.value,
        Media: JSON.stringify(editMedia.value),
        IsVisible: editIsVisible.value,
        IsDefault: editIsDefault.value,
        Price: parseFloat(editPrice.value),
        ActionBy: -1,
      });

      if (res.result) {
        await loadTemplates();
        showMessage({
          status: "success",
          message: t("updated_successfully_label"),
        });
        clearEditTemplateFields();
        return true;
      } else {
        showMessage({ status: "error", message: res.message });
      }
    } catch (error) {
      console.log(error);
      showMessage({ status: "error", message: error.toString() });
    } finally {
      setGlobalLoading(false);
    }

    return false;
  };

  const onRemoveTemplate = async () => {
    setGlobalLoading(true);

    try {
      const res = await TemplatesController.removeTemplate(selectedId.value);

      if (res.result) {
        await loadTemplates();
        showMessage({
          status: "success",
          message: t("deleted_successfully_label"),
        });
        return true;
      } else {
        showMessage({ status: "error", message: res.message });
      }
    } catch (error) {
      console.log(error);
      showMessage({ status: "error", message: error.toString() });
    } finally {
      setGlobalLoading(false);
    }

    return false;
  };

  // Media management
  const onAddAddTemplateMedia = async (ev) => {
    const file = ev.target.files[0];
    if (!file) {
      return;
    }

    setGlobalLoading(true);

    try {
      const form = new FormData();

      form.append("file", file);

      const res = await FileManagementController.uploadTemplatePhoto(form);

      if (res.result) {
        addToAddTemplateMedia({
          type: "photo",
          url: res.url,
        });
      } else {
        showMessage({
          status: "error",
          message: t("something_went_wrong_label"),
        });
      }
    } catch (error) {
      console.log(error);
      showMessage({ status: "error", message: error.toString() });
    } finally {
      setGlobalLoading(false);
    }
  };

  const removeAddTemplateMedia = (index) => {
    addMedia.value.splice(index, 1);
  };

  const onAddEditTemplateMedia = async (ev) => {
    const file = ev.target.files[0];
    if (!file) {
      return;
    }

    setGlobalLoading(true);

    try {
      const form = new FormData();

      form.append("file", file);

      const res = await FileManagementController.uploadTemplatePhoto(form);

      if (res.result) {
        addToEditTemplateMedia({
          type: "photo",
          url: res.url,
        });
      } else {
        showMessage({
          status: "error",
          message: t("something_went_wrong_label"),
        });
      }
    } catch (error) {
      console.log(error);
      showMessage({ status: "error", message: error.toString() });
    } finally {
      setGlobalLoading(false);
    }
  };

  const removeEditTemplateMedia = (index) => {
    editMedia.value.splice(index, 1);
  };

  // Template operations
  const onAddToMyTemplates = async (templateId) => {
    try {
      const res = await TemplatesController.addUserTemplate(templateId);

      if (res.result) {
        await getMyTemplates();
        return true;
      } else {
        showMessage({ status: "error", message: res.message });
      }
    } catch (error) {
      console.log(error);
      showMessage({ status: "error", message: error.toString() });
    }
    return false;
  };

  const onUseTemplate = async (templateId) => {
    setGlobalLoading(true);

    try {
      // Implementation for using template
      // This would depend on your specific use case
    } catch (error) {
      console.log(error);
      showMessage({ status: "error", message: error.toString() });
    } finally {
      setGlobalLoading(false);
    }
  };

  // Data loading functions
  const loadTemplates = async () => {
    try {
      const res = await TemplatesController.getTemplates();

      if (res.result) {
        setAvailableTemplates(res.data);
      } else {
        showMessage({ status: "error", message: res.message });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMyTemplates = async () => {
    try {
      const res = await TemplatesController.getCurrentUserTemplates();

      if (res.result) {
        const userTemplateIds = res.data.map((ele) => parseInt(ele.templateId));
        const filteredTemplates = templates.value.filter((element) =>
          userTemplateIds.includes(parseInt(element.id))
        );
        setMyTemplates(filteredTemplates);
      } else {
        showMessage({ status: "error", message: res.message });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getData = async () => {
    setGlobalLoading(true);

    try {
      await loadTemplates();
      await getMyTemplates();
    } catch (error) {
      console.log(error);
    } finally {
      setGlobalLoading(false);
    }
  };

  return {
    // Template lists
    templates,
    filteredTemplates,
    myTemplates,

    // Selected template
    selectedId,
    selectedTemplate,

    // Add Template fields
    addName,
    addDescription,
    addPrice,
    addContent,
    addMedia,
    addIsVisible,
    addIsDefault,

    // Edit Template fields
    editName,
    editDescription,
    editPrice,
    editContent,
    editMedia,
    editIsVisible,
    editIsDefault,

    // Setters
    setEditTemplateIsVisible,
    setEditTemplateMedia,
    addToEditTemplateMedia,
    clearEditTemplateMedia,
    setAddTemplateIsVisible,
    setAddTemplateMedia,
    addToAddTemplateMedia,
    clearAddTemplateMedia,
    setSelectedTemplate,
    setSelectedTemplateId,
    setAvailableTemplates,
    addToAvailableTemplates,
    clearAvailableTemplates,
    setMyTemplates,
    addToMyTemplates,
    clearMyTemplates,

    // Validation
    validateAddTemplateFields,
    validateEditTemplateFields,

    // Clear functions
    clearAddTemplateFields,
    clearEditTemplateFields,

    // CRUD operations
    onAddTemplate,
    onEditTemplate,
    onRemoveTemplate,

    // Media management
    onAddAddTemplateMedia,
    removeAddTemplateMedia,
    onAddEditTemplateMedia,
    removeEditTemplateMedia,

    // Template operations
    onAddToMyTemplates,
    onUseTemplate,

    // Data loading
    loadTemplates,
    getMyTemplates,
    getData,
  };
};
