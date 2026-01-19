"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as orderApi from "../orders/api";
import PdfRowOverlayViewer from "@/components/PdfRowOverlayViewer";
import { getAllMachines, addMachine } from "../../AdminUser/machines/api";

// Status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    "In Progress": "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Completed: "bg-green-100 text-green-800",
    "On Hold": "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

export default function ProductionLinePage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [orders, setOrders] = useState([]);
  const [pdfMap, setPdfMap] = useState({});
  const [pdfModalUrl, setPdfModalUrl] = useState(null);

  // ✅ Detect PDF type
  const [pdfType, setPdfType] = useState("standard"); // "standard" | "nesting"
  const [activePdfTab, setActivePdfTab] = useState("subnest");
  const [isRowsLoading, setIsRowsLoading] = useState(false);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });

  // ✅ Machines
  const [showSelectMachineModal, setShowSelectMachineModal] = useState(false);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [machines, setMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [isSendingToMachine, setIsSendingToMachine] = useState(false);

  const [addMachineForm, setAddMachineForm] = useState({
    name: "",
    status: "Active",
  });

  const [userRole, setUserRole] = useState("PRODUCTION");

  // ==========================
  // ✅ HELPERS
  // ==========================
  const getToken = () => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("swiftflow-user") : null;
    if (!raw) return null;
    try {
      const auth = JSON.parse(raw);
      return auth?.token || null;
    } catch {
      return null;
    }
  };

  const numericOrderId = (orderId) => String(orderId || "").replace(/^SF/i, "");

  const ensureMachinesLoaded = async () => {
    if (machines.length > 0 || machinesLoading) return;
    try {
      setMachinesLoading(true);
      const data = await getAllMachines();
      setMachines(data || []);
    } catch (err) {
      console.error("Error loading machines:", err);
    } finally {
      setMachinesLoading(false);
    }
  };

  // ==========================
  // ✅ STANDARD PDF STATES
  // ==========================
  const [pdfRows, setPdfRows] = useState([]);
  const [partsRows, setPartsRows] = useState([]);
  const [materialRows, setMaterialRows] = useState([]);

  // ✅ standard selections
  const [designerSelectedSubnestRowNos, setDesignerSelectedSubnestRowNos] = useState([]);
  const [productionSelectedSubnestRowNos, setProductionSelectedSubnestRowNos] = useState([]);
  const [machineSelectedSubnestRowNos, setMachineSelectedSubnestRowNos] = useState([]);
  const [inspectionSelectedSubnestRowNos, setInspectionSelectedSubnestRowNos] = useState([]);

  const [designerPartsSelectedRowIds, setDesignerPartsSelectedRowIds] = useState([]);
  const [productionPartsSelectedRowIds, setProductionPartsSelectedRowIds] = useState([]);
  const [machinePartsSelectedRowIds, setMachinePartsSelectedRowIds] = useState([]);
  const [inspectionPartsSelectedRowIds, setInspectionPartsSelectedRowIds] = useState([]);

  const [designerMaterialSelectedRowIds, setDesignerMaterialSelectedRowIds] = useState([]);
  const [productionMaterialSelectedRowIds, setProductionMaterialSelectedRowIds] = useState([]);
  const [machineMaterialSelectedRowIds, setMachineMaterialSelectedRowIds] = useState([]);
  const [inspectionMaterialSelectedRowIds, setInspectionMaterialSelectedRowIds] = useState([]);

  // ==========================
  // ✅ NESTING PDF STATES
  // ==========================
  const [resultBlocks, setResultBlocks] = useState([]);
  const [plateInfoRows, setPlateInfoRows] = useState([]);
  const [partInfoRows, setPartInfoRows] = useState([]);
  const [activeResultNo, setActiveResultNo] = useState(null);

  // nesting role selections
  const [designerSelectedRowIds, setDesignerSelectedRowIds] = useState([]);
  const [productionSelectedRowIds, setProductionSelectedRowIds] = useState([]);
  const [machineSelectedRowIds, setMachineSelectedRowIds] = useState([]);
  const [inspectionSelectedRowIds, setInspectionSelectedRowIds] = useState([]);

  // active block
  const activeResultBlock = useMemo(() => {
    if (!activeResultNo) return null;
    return (
      (resultBlocks || []).find((b) => Number(b?.resultNo) === Number(activeResultNo)) || null
    );
  }, [resultBlocks, activeResultNo]);

  // ==========================
  // ✅ IDS HELPERS
  // ==========================
  const partsRowNoCounts = useMemo(() => {
    const counts = {};
    (partsRows || []).forEach((r) => {
      const k = r?.rowNo;
      if (k === undefined || k === null) return;
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [partsRows]);

  const getPartsSelectionId = (row, idx) => {
    const rn = row?.rowNo;
    if (rn === undefined || rn === null) return String(idx);
    if ((partsRowNoCounts[rn] || 0) > 1) return `${rn}-${idx}`;
    return String(rn);
  };

  const getNestingResultId = (block) => `RESULT-${block?.resultNo}`;
  const getNestingPlateId = (row) => `PLATE-${row?.order}-${row?.plateSize}`;
  const getNestingPartId = (row, idx) => `PART-${row?.order}-${row?.partName}-${idx}`;
  const getNestingResultPartId = (resultNo, partRow, idx) =>
    `RESULTPART-${resultNo}-${partRow?.partName ?? "PART"}-${idx}`;

  const ThumbnailBox = () => (
    <div className="w-[52px] h-[32px] border border-gray-300 rounded bg-white flex items-center justify-center text-[10px] text-gray-400">
      —
    </div>
  );

  // ==========================
  // ✅ ROLE UI HELPERS
  // ==========================
  const canEditRole = (role) => userRole === role;

  const isCheckedByRole = (role, id) => {
    if (role === "DESIGN") return designerSelectedRowIds.includes(id);
    if (role === "PRODUCTION") return productionSelectedRowIds.includes(id);
    if (role === "MACHINING") return machineSelectedRowIds.includes(id);
    if (role === "INSPECTION") return inspectionSelectedRowIds.includes(id);
    return false;
  };

  const toggleRoleRow = (role, id) => {
    if (!canEditRole(role)) return;

    const toggle = (prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];

    if (role === "DESIGN") setDesignerSelectedRowIds(toggle);
    if (role === "PRODUCTION") setProductionSelectedRowIds(toggle);
    if (role === "MACHINING") setMachineSelectedRowIds(toggle);
    if (role === "INSPECTION") setInspectionSelectedRowIds(toggle);
  };

  // ==========================
  // ✅ RESET
  // ==========================
  const resetPdfStates = () => {
    setPdfRows([]);
    setPartsRows([]);
    setMaterialRows([]);

    setDesignerSelectedSubnestRowNos([]);
    setProductionSelectedSubnestRowNos([]);
    setMachineSelectedSubnestRowNos([]);
    setInspectionSelectedSubnestRowNos([]);

    setDesignerPartsSelectedRowIds([]);
    setProductionPartsSelectedRowIds([]);
    setMachinePartsSelectedRowIds([]);
    setInspectionPartsSelectedRowIds([]);

    setDesignerMaterialSelectedRowIds([]);
    setProductionMaterialSelectedRowIds([]);
    setMachineMaterialSelectedRowIds([]);
    setInspectionMaterialSelectedRowIds([]);

    setResultBlocks([]);
    setPlateInfoRows([]);
    setPartInfoRows([]);
    setActiveResultNo(null);

    setDesignerSelectedRowIds([]);
    setProductionSelectedRowIds([]);
    setMachineSelectedRowIds([]);
    setInspectionSelectedRowIds([]);

    setSelectedMachineId("");
  };

  // ==========================
  // ✅ LOAD ORDERS
  // ==========================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const all = await orderApi.getAllOrders();

        const transformed = all.map((order) => {
          const product = (order.products && order.products[0]) || {};
          return {
            id: `SF${order.orderId}`,
            product: product.productName || product.productCode || "Unknown Product",
            quantity: order.units || "",
            status: order.status || "Production",
            startDate: order.dateAdded || "",
            dueDate: "",
            assignedTo: "",
            department: order.department,
          };
        });

        setOrders(transformed);
      } catch (err) {
        console.error("Error fetching orders for production:", err);
      }
    };

    fetchOrders();
  }, []);

  // ==========================
  // ✅ FETCH PDF MAP
  // ==========================
  useEffect(() => {
    const fetchPdfInfo = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const entries = await Promise.all(
          orders.map(async (order) => {
            const numericId = String(order.id).replace(/^SF/i, "");
            if (!numericId) return [order.id, null];

            try {
              const resp = await fetch(`http://localhost:8080/status/order/${numericId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!resp.ok) return [order.id, null];

              const history = await resp.json();

              const withPdf = Array.isArray(history)
                ? history
                    .filter(
                      (h) =>
                        h.attachmentUrl &&
                        h.attachmentUrl.toLowerCase().endsWith(".pdf") &&
                        ((h.newStatus || "").toUpperCase() === "PRODUCTION" ||
                          (h.newStatus || "").toUpperCase() === "PRODUCTION_READY")
                    )
                    .sort((a, b) => a.id - b.id)
                    .at(-1)
                : null;

              return [order.id, withPdf ? withPdf.attachmentUrl : null];
            } catch {
              return [order.id, null];
            }
          })
        );

        const map = {};
        entries.forEach(([id, url]) => (map[id] = url));
        setPdfMap(map);
      } catch (e) {
        console.error(e);
      }
    };

    if (orders.length > 0) fetchPdfInfo();
    else setPdfMap({});
  }, [orders]);

  // ==========================
  // ✅ FILTERED ORDERS
  // ==========================
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const dept = (order.department || "").toUpperCase();
        return dept === "PRODUCTION" || dept === "PRODUCTION_READY";
      })
      .filter((order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.product || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [orders, searchQuery, statusFilter]);

  const statusOptions = ["All", "In Progress", "Pending", "Completed", "On Hold"];

  // ==========================
  // ✅ LOAD SAVED CHECKBOX SELECTION (STANDARD + NESTING)
  // ==========================
  const loadThreeCheckboxSelection = async (orderId) => {
    const token = getToken();
    if (!token) return;

    const numericId = numericOrderId(orderId);
    if (!numericId) return;

    try {
      const res = await fetch(
        `http://localhost:8080/pdf/order/${numericId}/three-checkbox-selection`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;

      const data = await res.json();

      // ✅ nesting role selection
      setDesignerSelectedRowIds(Array.isArray(data?.designerSelectedRowIds) ? data.designerSelectedRowIds : []);
      setProductionSelectedRowIds(Array.isArray(data?.productionSelectedRowIds) ? data.productionSelectedRowIds : []);
      setMachineSelectedRowIds(Array.isArray(data?.machineSelectedRowIds) ? data.machineSelectedRowIds : []);
      setInspectionSelectedRowIds(Array.isArray(data?.inspectionSelectedRowIds) ? data.inspectionSelectedRowIds : []);

      // ✅ standard selections mapping
      setDesignerSelectedSubnestRowNos(Array.isArray(data?.designerSelectedSubnestRowNos) ? data.designerSelectedSubnestRowNos : []);
      setProductionSelectedSubnestRowNos(Array.isArray(data?.productionSelectedSubnestRowNos) ? data.productionSelectedSubnestRowNos : []);
      setMachineSelectedSubnestRowNos(Array.isArray(data?.machineSelectedSubnestRowNos) ? data.machineSelectedSubnestRowNos : []);
      setInspectionSelectedSubnestRowNos(Array.isArray(data?.inspectionSelectedSubnestRowNos) ? data.inspectionSelectedSubnestRowNos : []);
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================
  // ✅ MAIN: OPEN PDF MODAL (DETECT TYPE + LOAD)
  // ==========================
  const openPdfModalForAttachment = async (attachmentUrl, orderId) => {
    setPdfModalUrl(attachmentUrl);
    resetPdfStates();

    setIsRowsLoading(true);
    setIsAnalyzingPdf(true);

    const token = getToken();
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // ✅ TRY NESTING FIRST
      const plateApi = `http://localhost:8080/api/nesting/plate-info?attachmentUrl=${encodeURIComponent(
        attachmentUrl
      )}`;
      const partApi = `http://localhost:8080/api/nesting/part-info?attachmentUrl=${encodeURIComponent(
        attachmentUrl
      )}`;
      const resultApi = `http://localhost:8080/api/nesting/results?attachmentUrl=${encodeURIComponent(
        attachmentUrl
      )}`;

      const [plateRes, partRes, resultRes] = await Promise.all([
        fetch(plateApi, { headers }),
        fetch(partApi, { headers }),
        fetch(resultApi, { headers }),
      ]);

      const plateData = plateRes.ok ? await plateRes.json() : [];
      const partData = partRes.ok ? await partRes.json() : [];
      const resultData = resultRes.ok ? await resultRes.json() : [];

      const hasNesting = Array.isArray(resultData) && resultData.length > 0;

      if (hasNesting) {
        setPdfType("nesting");
        setActivePdfTab("results");

        setPlateInfoRows(Array.isArray(plateData) ? plateData : []);
        setPartInfoRows(Array.isArray(partData) ? partData : []);
        setResultBlocks(Array.isArray(resultData) ? resultData : []);

        const sorted = [...resultData].sort((a, b) => (a?.resultNo || 0) - (b?.resultNo || 0));
        setActiveResultNo(sorted?.[0]?.resultNo ?? null);

        await loadThreeCheckboxSelection(orderId);

        setIsAnalyzingPdf(false);
        setIsRowsLoading(false);
        return;
      }

      // ✅ ELSE STANDARD
      const baseSubnest = `http://localhost:8080/api/pdf/subnest/by-url?attachmentUrl=${encodeURIComponent(
        attachmentUrl
      )}`;
      const baseParts = `http://localhost:8080/api/pdf/subnest/parts/by-url?attachmentUrl=${encodeURIComponent(
        attachmentUrl
      )}`;
      const baseMaterial = `http://localhost:8080/api/pdf/subnest/material-data/by-url?attachmentUrl=${encodeURIComponent(
        attachmentUrl
      )}`;

      const [subnestRes, partsRes, materialRes] = await Promise.all([
        fetch(baseSubnest, { headers }),
        fetch(baseParts, { headers }),
        fetch(baseMaterial, { headers }),
      ]);

      const subnestData = subnestRes.ok ? await subnestRes.json() : [];
      const partsData = partsRes.ok ? await partsRes.json() : [];
      const materialData = materialRes.ok ? await materialRes.json() : [];

      setPdfType("standard");
      setActivePdfTab("subnest");

      setPdfRows(Array.isArray(subnestData) ? subnestData : []);
      setPartsRows(Array.isArray(partsData) ? partsData : []);
      setMaterialRows(Array.isArray(materialData) ? materialData : []);

      await loadThreeCheckboxSelection(orderId);
    } catch (e) {
      console.error("PDF detect error:", e);
      setToast({ message: "Failed to load PDF", type: "error" });
    } finally {
      setIsAnalyzingPdf(false);
      setIsRowsLoading(false);
    }
  };

  // ==========================
  // ✅ SAVE PRODUCTION SELECTION
  // ==========================
  const saveProductionSelection = async (orderId) => {
    const token = getToken();
    if (!token) return;

    const numericId = numericOrderId(orderId);
    if (!numericId) return;

    const payload = {
      productionSelectedRowIds: productionSelectedRowIds,
      productionSelectedSubnestRowNos: productionSelectedSubnestRowNos,
      productionPartsSelectedRowIds: productionPartsSelectedRowIds,
      productionMaterialSelectedRowIds: productionMaterialSelectedRowIds,
    };

    try {
      const res = await fetch(
        `http://localhost:8080/pdf/order/${numericId}/three-checkbox-selection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) setToast({ message: "Production selection saved ✅", type: "success" });
      else setToast({ message: "Failed to save production selection", type: "error" });
    } catch {
      setToast({ message: "Error saving selection", type: "error" });
    }
  };

  // ==========================
  // ✅ SEND TO MACHINE (SAVE + MACHINING API + STATUS CREATE)
  // ==========================
  const sendToMachineFlow = async (orderId) => {
    const token = getToken();
    if (!token) return;

    const numericId = numericOrderId(orderId);
    if (!numericId) return;

    if (!selectedMachineId) {
      setToast({ message: "Please select a machine", type: "error" });
      return;
    }

    const anySelected =
      (pdfType === "standard" && productionSelectedSubnestRowNos.length > 0) ||
      (pdfType === "nesting" && productionSelectedRowIds.length > 0);

    if (!anySelected) {
      setToast({ message: "Select at least 1 row before sending!", type: "error" });
      return;
    }

    try {
      setIsSendingToMachine(true);

      // ✅ 1) save selection
      await saveProductionSelection(orderId);

      // ✅ 2) machining-selection
      const selectedRowIds =
        pdfType === "standard"
          ? productionSelectedSubnestRowNos.map(String)
          : productionSelectedRowIds.map(String);

      const machRes = await fetch(
        `http://localhost:8080/pdf/order/${numericId}/machining-selection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selectedRowIds,
            machineId: selectedMachineId,
            attachmentUrl: pdfModalUrl,
          }),
        }
      );

      if (!machRes.ok) {
        let msg = "Failed to send to Machine";
        try {
          const err = await machRes.json();
          if (err?.message) msg = err.message;
        } catch {}
        setToast({ message: msg, type: "error" });
        return;
      }

      // ✅ 3) update status -> MACHINING
      const statusPayload = {
        newStatus: "MACHINING",
        comment: "Production selection sent to Machine",
        percentage: null,
        attachmentUrl: pdfModalUrl,
      };

      const formData = new FormData();
      formData.append(
        "status",
        new Blob([JSON.stringify(statusPayload)], { type: "application/json" })
      );

      const statusRes = await fetch(`http://localhost:8080/status/create/${numericId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!statusRes.ok) {
        setToast({ message: "Machine assigned but failed to update status", type: "error" });
        return;
      }

      setToast({ message: "Sent to Machine ✅", type: "success" });
      setShowSelectMachineModal(false);
      setPdfModalUrl(null);
      resetPdfStates();
    } catch (e) {
      console.error(e);
      setToast({ message: "Error sending to Machine", type: "error" });
    } finally {
      setIsSendingToMachine(false);
    }
  };

  // ==========================
  // ✅ UI
  // ==========================
  return (
    <div className="w-full p-4 sm:p-6">
      {/* header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Production Line</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage production orders in real-time
            </p>
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search by order ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* orders */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PDF
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {pdfMap[order.id] ? (
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-800 hover:underline text-xs"
                          onClick={async () => {
                            const url = pdfMap[order.id];
                            if (!url) return;
                            const urlWithNoCache = url + "?t=" + Date.now();
                            await openPdfModalForAttachment(urlWithNoCache, order.id);
                          }}
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Modal */}
      {pdfModalUrl && (
        <div className="fixed inset-0 z-50">
          {toast.message && (
            <div
              className={`absolute top-4 right-4 z-[60] px-4 py-2 rounded-md text-sm shadow-lg border flex items-center gap-2 ${
                toast.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <span>{toast.message}</span>
              <button
                className="ml-2 text-xs font-semibold hover:underline"
                onClick={() => setToast({ message: "", type: "" })}
              >
                Close
              </button>
            </div>
          )}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setPdfModalUrl(null);
              resetPdfStates();
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl h-[85vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  PDF Preview & Selection (Production)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setPdfModalUrl(null);
                    resetPdfStates();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 min-h-0 flex">
                {/* LEFT PDF */}
                <div className="w-1/2 border-r border-gray-200">
                  {(isRowsLoading || isAnalyzingPdf) ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
                        <p className="text-sm text-gray-600">
                          {isAnalyzingPdf ? "Detecting PDF type..." : "Loading PDF data..."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <PdfRowOverlayViewer
                      pdfUrl={pdfModalUrl}
                      rows={[]}
                      selectedRowIds={[]}
                      onToggleRow={() => {}}
                      showCheckboxes={false}
                      initialScale={1.1}
                    />
                  )}
                </div>

                {/* RIGHT */}
                <div className="w-1/2 flex flex-col">
                  {/* tabs */}
                  <div className="border-b border-gray-200 flex items-center justify-between px-3 py-2 text-xs">
                    <div className="flex gap-2">
                      {pdfType === "standard" ? (
                        <>
                          <button
                            type="button"
                            className={activePdfTab === "subnest" ? "font-semibold text-indigo-600" : "text-gray-600"}
                            onClick={() => setActivePdfTab("subnest")}
                          >
                            SubNest
                          </button>
                          <button
                            type="button"
                            className={activePdfTab === "parts" ? "font-semibold text-indigo-600" : "text-gray-600"}
                            onClick={() => setActivePdfTab("parts")}
                          >
                            Parts
                          </button>
                          <button
                            type="button"
                            className={activePdfTab === "material" ? "font-semibold text-indigo-600" : "text-gray-600"}
                            onClick={() => setActivePdfTab("material")}
                          >
                            Material Data
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className={activePdfTab === "results" ? "font-semibold text-indigo-600" : "text-gray-600"}
                            onClick={() => setActivePdfTab("results")}
                          >
                            Results
                          </button>
                          <button
                            type="button"
                            className={activePdfTab === "plate-info" ? "font-semibold text-indigo-600" : "text-gray-600"}
                            onClick={() => setActivePdfTab("plate-info")}
                          >
                            Plate Info
                          </button>
                          <button
                            type="button"
                            className={activePdfTab === "part-info" ? "font-semibold text-indigo-600" : "text-gray-600"}
                            onClick={() => setActivePdfTab("part-info")}
                          >
                            Part Info
                          </button>
                        </>
                      )}
                    </div>

                    <span className="text-xs text-gray-500">
                      {pdfType === "nesting" ? "Nesting PDF" : "Standard PDF"} | Role:{" "}
                      <b>{userRole}</b>
                    </span>
                  </div>

                  {/* tables */}
                  {!isAnalyzingPdf && !isRowsLoading && (
                    <div className="flex-1 overflow-auto p-2 text-xs text-gray-900">
                      {/* ✅ STANDARD */}
                      {pdfType === "standard" && (
                        <>
                          {activePdfTab === "subnest" && (
                            <table className="min-w-full border border-gray-200">
                              <thead>
                                <tr className="text-left text-gray-700 border-b border-gray-200">
                                  <th className="px-2 py-1">No.</th>
                                  <th className="px-2 py-1">NC file</th>

                                  <th className="px-2 py-1 text-center">Designer</th>
                                  <th className="px-2 py-1 text-center">Production</th>
                                  <th className="px-2 py-1 text-center">Machine</th>
                                  <th className="px-2 py-1 text-center">Inspection</th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-gray-100">
                                {pdfRows.map((row) => (
                                  <tr key={row.rowNo}>
                                    <td className="px-2 py-1">{row.rowNo}</td>
                                    <td className="px-2 py-1">{row.ncFile}</td>

                                    <td className="px-2 py-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={designerSelectedSubnestRowNos.includes(row.rowNo)}
                                        disabled
                                        className="cursor-not-allowed opacity-50"
                                      />
                                    </td>

                                    <td className="px-2 py-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={productionSelectedSubnestRowNos.includes(row.rowNo)}
                                        disabled={!canEditRole("PRODUCTION")}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setProductionSelectedSubnestRowNos((prev) =>
                                            checked ? [...prev, row.rowNo] : prev.filter((x) => x !== row.rowNo)
                                          );
                                        }}
                                        className={canEditRole("PRODUCTION") ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                                      />
                                    </td>

                                    <td className="px-2 py-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={machineSelectedSubnestRowNos.includes(row.rowNo)}
                                        disabled
                                        className="cursor-not-allowed opacity-50"
                                      />
                                    </td>

                                    <td className="px-2 py-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={inspectionSelectedSubnestRowNos.includes(row.rowNo)}
                                        disabled
                                        className="cursor-not-allowed opacity-50"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          {activePdfTab === "parts" && (
                            <table className="min-w-full border border-gray-200">
                              <thead>
                                <tr className="text-left text-gray-700 border-b border-gray-200">
                                  <th className="px-2 py-1">No.</th>
                                  <th className="px-2 py-1">Part</th>
                                  <th className="px-2 py-1 text-center">Designer</th>
                                  <th className="px-2 py-1 text-center">Production</th>
                                  <th className="px-2 py-1 text-center">Machine</th>
                                  <th className="px-2 py-1 text-center">Inspection</th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-gray-100">
                                {partsRows.map((row, idx) => {
                                  const id = getPartsSelectionId(row, idx);
                                  return (
                                    <tr key={id}>
                                      <td className="px-2 py-1">{idx + 1}</td>
                                      <td className="px-2 py-1">{row.partName}</td>

                                      <td className="px-2 py-1 text-center">
                                        <input
                                          type="checkbox"
                                          checked={designerPartsSelectedRowIds.includes(id)}
                                          disabled
                                          className="cursor-not-allowed opacity-50"
                                        />
                                      </td>

                                      <td className="px-2 py-1 text-center">
                                        <input
                                          type="checkbox"
                                          checked={productionPartsSelectedRowIds.includes(id)}
                                          disabled={!canEditRole("PRODUCTION")}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            setProductionPartsSelectedRowIds((prev) =>
                                              checked ? [...prev, id] : prev.filter((x) => x !== id)
                                            );
                                          }}
                                          className={canEditRole("PRODUCTION") ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                                        />
                                      </td>

                                      <td className="px-2 py-1 text-center">
                                        <input
                                          type="checkbox"
                                          checked={machinePartsSelectedRowIds.includes(id)}
                                          disabled
                                          className="cursor-not-allowed opacity-50"
                                        />
                                      </td>

                                      <td className="px-2 py-1 text-center">
                                        <input
                                          type="checkbox"
                                          checked={inspectionPartsSelectedRowIds.includes(id)}
                                          disabled
                                          className="cursor-not-allowed opacity-50"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}

                          {activePdfTab === "material" && (
                            <table className="min-w-full border border-gray-200">
                              <thead>
                                <tr className="text-left text-gray-700 border-b border-gray-200">
                                  <th className="px-2 py-1">Material</th>
                                  <th className="px-2 py-1 text-center">Designer</th>
                                  <th className="px-2 py-1 text-center">Production</th>
                                  <th className="px-2 py-1 text-center">Machine</th>
                                  <th className="px-2 py-1 text-center">Inspection</th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-gray-100">
                                {materialRows.map((row, idx) => (
                                  <tr key={idx}>
                                    <td className="px-2 py-1">{row.material} {row.thickness}</td>

                                    <td className="px-2 py-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={designerMaterialSelectedRowIds.includes(idx)}
                                        disabled
                                        className="cursor-not-allowed opacity-50"
                                      />
                                    </td>

                                    <td className="px-2 py-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={productionMaterialSelectedRowIds.includes(idx)}
                                        disabled={!canEditRole("PRODUCTION")}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setProductionMaterialSelectedRowIds((prev) =>
                                            checked ? [...prev, idx] : prev.filter((x) => x !== idx)
                                          );
                                        }}
                                        className={canEditRole("PRODUCTION") ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                                      />
                                    </td>

                                    <td className="px-2 py-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={machineMaterialSelectedRowIds.includes(idx)}
                                        disabled
                                        className="cursor-not-allowed opacity-50"
                                      />
                                    </td>

                                    <td className="px-2 py-1 text-center">
                                      <input
                                        type="checkbox"
                                        checked={inspectionMaterialSelectedRowIds.includes(idx)}
                                        disabled
                                        className="cursor-not-allowed opacity-50"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </>
                      )}

                      {/* ✅ NESTING */}
                      {pdfType === "nesting" && (
                        <>
                          {activePdfTab === "results" && (
                            <>
                              {/* result chooser */}
                              <div className="mb-2">
                                <div className="text-[11px] font-semibold text-gray-700 mb-1">
                                  Select Result (1..15)
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {Array.from({ length: 15 }, (_, i) => i + 1).map((no) => {
                                    const exists = resultBlocks.some(
                                      (b) => Number(b?.resultNo) === no
                                    );
                                    return (
                                      <button
                                        key={no}
                                        type="button"
                                        disabled={!exists}
                                        onClick={() => exists && setActiveResultNo(no)}
                                        className={`shrink-0 px-3 py-1 rounded-full border text-[11px] font-semibold transition ${
                                          !exists
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                            : activeResultNo === no
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        Result {no}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* results table */}
                              <table className="min-w-full text-xs border border-gray-200">
                                <thead>
                                  <tr className="text-left text-gray-700 border-b border-gray-200">
                                    <th className="px-2 py-1">Result</th>
                                    <th className="px-2 py-1">Thumb</th>
                                    <th className="px-2 py-1">Material</th>

                                    {[
                                      { label: "D", role: "DESIGN" },
                                      { label: "P", role: "PRODUCTION" },
                                      { label: "M", role: "MACHINING" },
                                      { label: "I", role: "INSPECTION" },
                                    ].map((x) => (
                                      <th key={x.role} className="px-2 py-1 text-center">
                                        {x.label}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 text-gray-900">
                                  {resultBlocks
                                    .slice()
                                    .sort((a, b) => (a?.resultNo || 0) - (b?.resultNo || 0))
                                    .map((block) => {
                                      const id = getNestingResultId(block);
                                      const active =
                                        Number(block?.resultNo) === Number(activeResultNo);

                                      return (
                                        <tr
                                          key={id}
                                          className={active ? "bg-indigo-50" : ""}
                                          onClick={() => setActiveResultNo(block?.resultNo)}
                                        >
                                          <td className="px-2 py-1 font-semibold">{block.resultNo}</td>
                                          <td className="px-2 py-1"><ThumbnailBox /></td>
                                          <td className="px-2 py-1">{block.material}</td>

                                          {["DESIGN", "PRODUCTION", "MACHINING", "INSPECTION"].map(
                                            (role) => (
                                              <td
                                                key={role}
                                                className="px-2 py-1 text-center"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={isCheckedByRole(role, id)}
                                                  disabled={!canEditRole(role)}
                                                  onChange={() => toggleRoleRow(role, id)}
                                                  className={
                                                    canEditRole(role)
                                                      ? "cursor-pointer"
                                                      : "cursor-not-allowed opacity-50"
                                                  }
                                                />
                                              </td>
                                            )
                                          )}
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>

                              {/* parts list */}
                              <div className="mt-3 border border-gray-200 rounded">
                                <div className="px-2 py-1 text-[11px] font-semibold text-gray-700 border-b border-gray-200 flex items-center justify-between">
                                  <span>
                                    Parts List {activeResultNo ? `(Result ${activeResultNo})` : ""}
                                  </span>
                                  <span className="text-gray-500 font-normal">
                                    {(activeResultBlock?.parts || []).length} Parts Total
                                  </span>
                                </div>

                                <table className="min-w-full text-xs">
                                  <thead>
                                    <tr className="text-left text-gray-700 border-b border-gray-200">
                                      <th className="px-2 py-1">Thumb</th>
                                      <th className="px-2 py-1">Part</th>

                                      {[
                                        { label: "D", role: "DESIGN" },
                                        { label: "P", role: "PRODUCTION" },
                                        { label: "M", role: "MACHINING" },
                                        { label: "I", role: "INSPECTION" },
                                      ].map((x) => (
                                        <th key={x.role} className="px-2 py-1 text-center">
                                          {x.label}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y divide-gray-100 text-gray-900">
                                    {(activeResultBlock?.parts || []).map((p, idx) => {
                                      const rowId = getNestingResultPartId(activeResultNo, p, idx);
                                      return (
                                        <tr key={rowId}>
                                          <td className="px-2 py-1"><ThumbnailBox /></td>
                                          <td className="px-2 py-1 font-medium">{p.partName}</td>

                                          {["DESIGN", "PRODUCTION", "MACHINING", "INSPECTION"].map(
                                            (role) => (
                                              <td key={role} className="px-2 py-1 text-center">
                                                <input
                                                  type="checkbox"
                                                  checked={isCheckedByRole(role, rowId)}
                                                  disabled={!canEditRole(role)}
                                                  onChange={() => toggleRoleRow(role, rowId)}
                                                  className={
                                                    canEditRole(role)
                                                      ? "cursor-pointer"
                                                      : "cursor-not-allowed opacity-50"
                                                  }
                                                />
                                              </td>
                                            )
                                          )}
                                        </tr>
                                      );
                                    })}

                                    {(activeResultBlock?.parts || []).length === 0 && (
                                      <tr>
                                        <td colSpan={6} className="px-2 py-3 text-center text-gray-400">
                                          No Parts list found.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}

                          {activePdfTab === "plate-info" && (
                            <table className="min-w-full text-xs border border-gray-200">
                              <thead>
                                <tr className="text-left text-gray-700 border-b border-gray-200">
                                  <th className="px-2 py-1">Order</th>
                                  <th className="px-2 py-1">Plate Size</th>

                                  {[
                                    { label: "D", role: "DESIGN" },
                                    { label: "P", role: "PRODUCTION" },
                                    { label: "M", role: "MACHINING" },
                                    { label: "I", role: "INSPECTION" },
                                  ].map((x) => (
                                    <th key={x.role} className="px-2 py-1 text-center">
                                      {x.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-gray-100 text-gray-900">
                                {plateInfoRows.map((row, idx) => {
                                  const id = getNestingPlateId(row);
                                  return (
                                    <tr key={id + idx}>
                                      <td className="px-2 py-1 font-medium">{row.order}</td>
                                      <td className="px-2 py-1">{row.plateSize}</td>

                                      {["DESIGN", "PRODUCTION", "MACHINING", "INSPECTION"].map((role) => (
                                        <td key={role} className="px-2 py-1 text-center">
                                          <input
                                            type="checkbox"
                                            checked={isCheckedByRole(role, id)}
                                            disabled={!canEditRole(role)}
                                            onChange={() => toggleRoleRow(role, id)}
                                            className={
                                              canEditRole(role)
                                                ? "cursor-pointer"
                                                : "cursor-not-allowed opacity-50"
                                            }
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}

                          {activePdfTab === "part-info" && (
                            <table className="min-w-full text-xs border border-gray-200">
                              <thead>
                                <tr className="text-left text-gray-700 border-b border-gray-200">
                                  <th className="px-2 py-1">Order</th>
                                  <th className="px-2 py-1">Part</th>

                                  {[
                                    { label: "D", role: "DESIGN" },
                                    { label: "P", role: "PRODUCTION" },
                                    { label: "M", role: "MACHINING" },
                                    { label: "I", role: "INSPECTION" },
                                  ].map((x) => (
                                    <th key={x.role} className="px-2 py-1 text-center">
                                      {x.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-gray-100 text-gray-900">
                                {partInfoRows.map((row, idx) => {
                                  const id = getNestingPartId(row, idx);
                                  return (
                                    <tr key={id}>
                                      <td className="px-2 py-1 font-medium">{row.order}</td>
                                      <td className="px-2 py-1">{row.partName}</td>

                                      {["DESIGN", "PRODUCTION", "MACHINING", "INSPECTION"].map((role) => (
                                        <td key={role} className="px-2 py-1 text-center">
                                          <input
                                            type="checkbox"
                                            checked={isCheckedByRole(role, id)}
                                            disabled={!canEditRole(role)}
                                            onChange={() => toggleRoleRow(role, id)}
                                            className={
                                              canEditRole(role)
                                                ? "cursor-pointer"
                                                : "cursor-not-allowed opacity-50"
                                            }
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* footer buttons */}
                  {!isAnalyzingPdf && !isRowsLoading && (
                    <div className="p-3 border-t border-gray-200 flex items-center justify-end gap-3 text-xs">
                      <button
                        type="button"
                        disabled={!canEditRole("PRODUCTION")}
                        onClick={async () => {
                          const current = Object.entries(pdfMap).find(([, url]) => url === pdfModalUrl);
                          if (!current) return;
                          const [orderId] = current;
                          await saveProductionSelection(orderId);
                        }}
                        className="rounded-md bg-indigo-600 disabled:bg-gray-300 disabled:text-gray-600 text-white py-2 px-4"
                      >
                        Save Selection
                      </button>

                      <button
                        type="button"
                        disabled={!canEditRole("PRODUCTION")}
                        onClick={async () => {
                          await ensureMachinesLoaded();
                          setShowSelectMachineModal(true);
                        }}
                        className="rounded-md bg-green-600 disabled:bg-gray-300 disabled:text-gray-600 text-white py-2 px-4"
                      >
                        Select Machine
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* select machine modal */}
          {showSelectMachineModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                onClick={() => setShowSelectMachineModal(false)}
              />
              <div
                className="relative bg-white rounded-lg w-full max-w-md shadow-lg border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Select Machine</h3>
                  <button
                    type="button"
                    onClick={() => setShowSelectMachineModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 space-y-4 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-700">Machine</label>
                    <button
                      type="button"
                      onClick={() => setShowAddMachineModal(true)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Add Machine
                    </button>
                  </div>

                  <select
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">{machinesLoading ? "Loading…" : "Select a machine"}</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.machineName} ({m.status})
                      </option>
                    ))}
                  </select>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSendingToMachine || !selectedMachineId}
                      onClick={async () => {
                        const current = Object.entries(pdfMap).find(([, url]) => url === pdfModalUrl);
                        if (!current) return;
                        const [orderId] = current;
                        await sendToMachineFlow(orderId);
                      }}
                      className="px-4 py-2 rounded-md bg-indigo-600 disabled:bg-gray-300 disabled:text-gray-600 text-white text-xs"
                    >
                      {isSendingToMachine ? "Sending…" : "Send to Machine"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* add machine modal */}
          {showSelectMachineModal && showAddMachineModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                onClick={() => setShowAddMachineModal(false)}
              />
              <div
                className="relative bg-white rounded-lg w-full max-w-md shadow-lg border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Add Machine</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddMachineModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                <form
                  className="p-4 space-y-4 text-sm"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const newMachine = await addMachine({
                        name: addMachineForm.name,
                        status: addMachineForm.status,
                        dateAdded: new Date().toISOString().split("T")[0],
                      });

                      setMachines((prev) => {
                        const existing = prev || [];
                        const without = existing.filter((m) => m.id !== newMachine.id);
                        return [...without, newMachine];
                      });

                      setSelectedMachineId(String(newMachine.id));
                      setAddMachineForm({ name: "", status: "Active" });
                      setShowAddMachineModal(false);
                    } catch (err) {
                      console.error("Error adding machine:", err);
                      alert("Failed to add machine: " + (err?.message || "Unknown error"));
                    }
                  }}
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Machine Name
                    </label>
                    <input
                      type="text"
                      value={addMachineForm.name}
                      onChange={(e) =>
                        setAddMachineForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={addMachineForm.status}
                      onChange={(e) =>
                        setAddMachineForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMachineModal(false)}
                      className="px-3 py-2 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Add Machine
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
