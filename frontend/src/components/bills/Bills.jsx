import { useState, useEffect } from "react";
import { billsAPI, refundRequestsAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  FileText,
  Calendar,
  DollarSign,
  Package,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RefundRequestForm from "../refunds/RefundRequestForm";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [selectedOrderItemForRefund, setSelectedOrderItemForRefund] =
    useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await billsAPI.getAll();
      setBills(response.data);
    } catch (error) {
      toast.error("Failed to load bills");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
  };

  const handlePrintBill = (bill) => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .bill-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PharmaTech</h1>
            <h2>Invoice / Bill</h2>
            <p>Bill Number: ${bill.billNumber}</p>
          </div>
          <div class="bill-info">
            <p><strong>Issue Date:</strong> ${formatDate(bill.issueDate)}</p>
            <p><strong>Order ID:</strong> #${bill.orderId}</p>
            <p><strong>Customer:</strong> ${bill.order?.userName || "N/A"}</p>
            <p><strong>Purchase Source:</strong> ${
              bill.order?.purchaseSource === "Pharmacy"
                ? "Purchased from Pharmacy"
                : "Purchased from Website"
            }</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch Number</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${
                bill.order?.items
                  ?.map(
                    (item) => `
                <tr>
                  <td>${item.medicineName}</td>
                  <td>${item.batchNumber}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.subTotal)}</td>
                </tr>
              `
                  )
                  .join("") || ""
              }
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: ${formatCurrency(bill.subTotal)}</p>
            <p>Tax: ${formatCurrency(bill.tax)}</p>
            <p style="font-size: 1.2em;">Total: ${formatCurrency(
              bill.totalAmount
            )}</p>
          </div>
          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Thank you for your purchase!</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <span>My Bills & Invoices</span>
        </h1>
        <p className="text-gray-600 mt-1">View all your purchase invoices</p>
      </div>

      {bills.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-24 w-24 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            No bills found
          </h3>
          <p className="mt-2 text-gray-600">
            You haven't made any purchases yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Bill #{bill.billNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order #{bill.orderId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {formatDate(bill.issueDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">
                        {bill.order?.items?.length || 0} item(s)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span className="text-sm">
                        <span className="font-medium">Purchase:</span>{" "}
                        {bill.order?.purchaseSource === "Pharmacy"
                          ? "From Pharmacy"
                          : "From Website"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(bill.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {bill.order?.items && bill.order.items.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Items:
                      </h4>
                      <div className="space-y-2">
                        {bill.order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm text-gray-600"
                          >
                            <span>
                              {item.medicineName} x{item.quantity}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.subTotal)}
                            </span>
                          </div>
                        ))}
                        {bill.order.items.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{bill.order.items.length - 3} more item(s)
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {bill.tax > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(bill.subTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">
                          {formatCurrency(bill.tax)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg mt-2 pt-2 border-t">
                        <span className="font-semibold text-gray-900">
                          Total:
                        </span>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(bill.totalAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleViewBill(bill)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => handlePrintBill(bill)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Bill #{selectedBill.billNumber}
                </h2>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-medium">
                    {formatDate(selectedBill.issueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">#{selectedBill.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">
                    {selectedBill.order?.userName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Source</p>
                  <p className="font-medium">
                    {selectedBill.order?.purchaseSource === "Pharmacy"
                      ? "Purchased from Pharmacy"
                      : "Purchased from Website"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        selectedBill.status === "Issued"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedBill.status}
                    </span>
                  </p>
                </div>
              </div>

              {selectedBill.order?.items &&
                selectedBill.order.items.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Medicine
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Batch Number
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Unit Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Subtotal
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedBill.order.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {item.medicineName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {item.batchNumber}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(item.subTotal)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {selectedBill.order &&
                                  (selectedBill.order.status === "Paid" ||
                                    selectedBill.order.status ===
                                      "Completed") && (
                                    <button
                                      onClick={() => {
                                        setSelectedOrderForRefund(
                                          selectedBill.order
                                        );
                                        setSelectedOrderItemForRefund(item);
                                        setShowRefundForm(true);
                                      }}
                                      className="text-orange-600 hover:text-orange-900 inline-flex items-center space-x-1 text-xs font-medium"
                                      title="Return this product"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                      <span>Return</span>
                                    </button>
                                  )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              <div className="border-t pt-4">
                <div className="flex justify-end space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Subtotal:</p>
                    <p className="text-sm text-gray-600 mb-1">Tax:</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      Total:
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {formatCurrency(selectedBill.subTotal)}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {formatCurrency(selectedBill.tax)}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      {formatCurrency(selectedBill.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedBill(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedBill.order &&
                  (selectedBill.order.status === "Paid" ||
                    selectedBill.order.status === "Completed") && (
                    <button
                      onClick={() => {
                        setSelectedOrderForRefund(selectedBill.order);
                        setShowRefundForm(true);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 inline-flex items-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Refund
                    </button>
                  )}
                <button
                  onClick={() => handlePrintBill(selectedBill)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 inline-flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Form Modal */}
      {showRefundForm && selectedOrderForRefund && (
        <RefundRequestForm
          orderId={selectedOrderForRefund.id}
          selectedOrderItem={selectedOrderItemForRefund}
          onClose={() => {
            setShowRefundForm(false);
            setSelectedOrderForRefund(null);
            setSelectedOrderItemForRefund(null);
          }}
          onSuccess={() => {
            setShowRefundForm(false);
            setSelectedOrderForRefund(null);
            setSelectedOrderItemForRefund(null);
            setSelectedBill(null);
            fetchBills();
          }}
        />
      )}
    </div>
  );
};

export default Bills;
