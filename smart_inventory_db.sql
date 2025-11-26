-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2025 at 02:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_inventory_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bannerimages`
--

CREATE TABLE `bannerimages` (
  `Id` int(11) NOT NULL,
  `ImageUrl` varchar(500) NOT NULL,
  `Title` varchar(200) DEFAULT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `LinkUrl` varchar(500) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `DisplayOrder` int(11) NOT NULL DEFAULT 0,
  `CreatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `UpdatedAt` datetime(6) DEFAULT NULL ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bannerimages`
--

INSERT INTO `bannerimages` (`Id`, `ImageUrl`, `Title`, `Description`, `LinkUrl`, `IsActive`, `DisplayOrder`, `CreatedAt`, `UpdatedAt`) VALUES
(11, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/sensodyne-v3/en_IN/pronamel/why-choose-pronamel/banners/banner-dt-pronamel.jpg.rendition.2800.1032.jpg?auto=format', 'Sansodyan', '', 'http://localhost:3000/brands', 1, 1, '2025-11-23 04:38:56.843214', '2025-11-26 12:15:46.628197'),
(12, 'https://imgs.search.brave.com/6ppEHm2sjRR7PdE21MABVx31XUMXJ5PMkFZpeSiwwro/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLWNm/NjUuY2gtc3RhdGlj/LmNvbS9jb250ZW50/L2RhbS9jZi1jb25z/dW1lci1oZWFsdGhj/YXJlL3BhbmFkb2wt/cmVib3JuL2VuX0FV/L3VwZGF0ZXMyMDI0/MDcvcGFuYWRvbC1i/YW5uZXItc2xpZGUy/LmpwZz9hdXRvPWZv/cm1hdA', 'Panadol', '\n', 'http://localhost:3000/brands', 1, 2, '2025-11-23 04:38:56.843214', '2025-11-26 12:15:51.762668'),
(13, 'https://www.online4pharmacy.com/media/catalog/category/Cold-Flu-Remedies.jpg', 'Cold-flu', '', 'http://localhost:3000/brands', 1, 3, '2025-11-23 04:38:56.843214', '2025-11-26 12:16:10.093669'),
(14, 'https://imgs.search.brave.com/aNQ27L8dLFw0748QnxVtD1rJadT0ESC1WpipFuicSs0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sZi10/dDRiLnRpa3Rva2Nk/bi5jb20vb2JqL2kx/OG5ibG9nL3R0NGJf/Y21zL2VzLTQxOS90/aXBkaWx6N3d5c3Et/N2lqUmsxT2t4eGtn/WU1tQWlhVkZkbC5q/cGVn', 'New Arrivals', 'Explore our latest pharmaceutical products', 'http://localhost:3000/brands', 1, 4, '2025-11-23 04:38:56.843214', '2025-11-26 12:04:15.926175');

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `Id` int(11) NOT NULL,
  `OrderId` int(11) NOT NULL,
  `BillNumber` varchar(100) NOT NULL,
  `IssueDate` datetime(6) NOT NULL,
  `SubTotal` decimal(12,2) NOT NULL,
  `Tax` decimal(12,2) NOT NULL,
  `TotalAmount` decimal(12,2) NOT NULL,
  `Status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bills`
--

INSERT INTO `bills` (`Id`, `OrderId`, `BillNumber`, `IssueDate`, `SubTotal`, `Tax`, `TotalAmount`, `Status`) VALUES
(15, 42, 'BILL-20251126-0001', '2025-11-26 03:46:35.954900', 806.00, 0.00, 811.00, 'Issued');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `Id` int(11) NOT NULL,
  `Name` varchar(150) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`Id`, `Name`, `Description`, `CreatedAt`) VALUES
(2, 'Panadol', 'Acetaminophen for pain and fever', '2025-11-23 02:45:23.701059'),
(3, 'Rexona', 'Rexona deodorants & antiperspirants for men and women.', '2025-11-26 13:49:32.000000'),
(4, 'Sensodyne', 'Category 33 - Oral care products for sensitive teeth.', '2025-11-26 14:12:22.000000');

-- --------------------------------------------------------

--
-- Table structure for table `cartitems`
--

CREATE TABLE `cartitems` (
  `Id` int(11) NOT NULL,
  `CartId` int(11) NOT NULL,
  `MedicineId` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`Id`, `UserId`, `CreatedAt`) VALUES
(5, 2, '2025-11-22 22:30:36.909202'),
(6, 4, '2025-11-26 03:43:39.536931');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `Id` int(11) NOT NULL,
  `Name` varchar(150) NOT NULL,
  `Description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`Id`, `Name`, `Description`) VALUES
(19, 'First Aid & Wound Care', 'Basic treatment for cuts, scrapes, burns, or injuries to prevent infection and promote healing.'),
(20, 'Allergy and Asthma', 'Conditions where the body overreacts to triggers like pollen, dust, or food (allergies), or has trouble breathing due to airway inflammation (asthma).'),
(21, 'Hair Care', 'Practices and products used to keep hair clean, healthy, and strong—helping prevent hair loss, dandruff, or damage.'),
(22, 'Urinary Tract Disease', 'Problems affecting the kidneys, bladder, or urethra—like infections (UTIs)—that can cause pain, frequent urination, or discomfort.'),
(23, 'Sleep Enhancer', 'Solutions (natural or medical) that help you fall asleep faster, stay asleep longer, and improve overall sleep quality.'),
(24, 'Bone Disease', 'Conditions like osteoporosis or arthritis that weaken bones, cause pain, or reduce mobility.'),
(25, 'Women Health', 'Health topics specific to women, including menstrual health, pregnancy, menopause, and reproductive care.'),
(26, 'Diabetes Mellitus', 'A condition where the body can’t properly control blood sugar, requiring diet, medication, or insulin to stay healthy.'),
(27, 'Digestive Health', 'How well your stomach and intestines process food—covering issues like bloating, constipation, acid reflux, or irritable bowel syndrome (IBS).'),
(28, 'Pain, Fever & Inflammation', 'Common symptoms the body shows when injured or sick—treated with medicines to reduce discomfort, lower temperature, or calm swelling.'),
(29, 'Eye Infection', 'Irritation, redness, or discharge in the eye caused by bacteria, viruses, or allergies—common examples include conjunctivitis (pink eye).'),
(30, 'Ear Infection', 'Pain, swelling, or fluid buildup in the ear, often caused by bacteria or viruses—common in children and may affect hearing or cause fever.'),
(31, 'Oral Care', 'Products for maintaining dental hygiene and oral health, including toothpaste, mouthwash, toothbrushes, and dental accessories.'),
(32, 'cold&flu', 'Helps fight everyday pains and for relieving fever'),
(33, 'Body-care', ' the maintenance and enhancement of the body, encompassing practices that look after the skin and hair from the neck down');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `Id` int(11) NOT NULL,
  `MedicineId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Content` varchar(1000) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `Id` int(11) NOT NULL,
  `Code` varchar(50) NOT NULL,
  `Name` varchar(200) NOT NULL,
  `DiscountType` varchar(50) NOT NULL,
  `DiscountValue` decimal(10,2) NOT NULL,
  `MinimumPurchase` decimal(10,2) DEFAULT NULL,
  `MaximumDiscount` decimal(10,2) DEFAULT NULL,
  `StartDate` datetime(6) NOT NULL,
  `EndDate` datetime(6) DEFAULT NULL,
  `UsageLimit` int(11) DEFAULT NULL,
  `UsedCount` int(11) NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `CreatedByAdminId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`Id`, `Code`, `Name`, `DiscountType`, `DiscountValue`, `MinimumPurchase`, `MaximumDiscount`, `StartDate`, `EndDate`, `UsageLimit`, `UsedCount`, `IsActive`, `CreatedAt`, `CreatedByAdminId`) VALUES
(1, '2IXLHGZU', 'SummerSale', 'Percentage', 0.50, NULL, NULL, '2025-11-24 00:00:00.000000', '2025-11-30 00:00:00.000000', NULL, 1, 1, '2025-11-24 02:06:05.794783', 2),
(2, 'VK3CW2RZ', 'Free-shipping-Offer', 'FreeShipping', 2.50, 0.00, NULL, '2025-11-24 00:00:00.000000', '2025-11-30 00:00:00.000000', NULL, 1, 1, '2025-11-24 02:10:55.993304', 2);

-- --------------------------------------------------------

--
-- Table structure for table `expiryalerts`
--

CREATE TABLE `expiryalerts` (
  `Id` int(11) NOT NULL,
  `BatchId` int(11) NOT NULL,
  `AlertType` varchar(50) NOT NULL,
  `AlertDate` datetime(6) NOT NULL,
  `IsResolved` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expiryalerts`
--

INSERT INTO `expiryalerts` (`Id`, `BatchId`, `AlertType`, `AlertDate`, `IsResolved`) VALUES
(49, 71, 'Near Expiry', '2025-11-26 03:27:38.460298', 1);

-- --------------------------------------------------------

--
-- Table structure for table `medicinebatches`
--

CREATE TABLE `medicinebatches` (
  `Id` int(11) NOT NULL,
  `MedicineId` int(11) NOT NULL,
  `BatchNumber` varchar(100) NOT NULL,
  `ExpiryDate` date NOT NULL,
  `Quantity` int(11) NOT NULL,
  `SupplierId` int(11) DEFAULT NULL,
  `PurchaseDate` date DEFAULT NULL,
  `UnitCost` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medicinebatches`
--

INSERT INTO `medicinebatches` (`Id`, `MedicineId`, `BatchNumber`, `ExpiryDate`, `Quantity`, `SupplierId`, `PurchaseDate`, `UnitCost`) VALUES
(70, 150, 'Rayaltris', '2026-12-31', 97, 1, '2025-11-01', 5.00),
(71, 211, 'Firstaid', '2025-11-30', 100, 5, '2025-11-01', 50.00),
(73, 151, 'New-farcolin', '2026-12-31', 100, 4, '2025-11-25', 15.00),
(74, 152, 'SYM', '2026-05-01', 5, 1, NULL, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE `medicines` (
  `Id` int(11) NOT NULL,
  `Name` varchar(150) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `CategoryId` int(11) DEFAULT NULL,
  `UnitPrice` decimal(10,2) NOT NULL,
  `ImageUrl` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `BrandId` int(11) DEFAULT NULL,
  `DiscountPercentage` decimal(5,2) DEFAULT NULL,
  `HasDiscount` tinyint(1) NOT NULL DEFAULT 0,
  `OriginalPrice` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medicines`
--

INSERT INTO `medicines` (`Id`, `Name`, `Description`, `CategoryId`, `UnitPrice`, `ImageUrl`, `CreatedAt`, `BrandId`, `DiscountPercentage`, `HasDiscount`, `OriginalPrice`) VALUES
(150, 'Ryaltris 600mg/5mg 240 Metered Nasal Sprays', 'Product Details:\nRYALTRIS 600mg/5mg METERED NASAL SPRAY is used for the treatment of nasal symptoms caused by allergic rhinitis, including sneezing, nasal congestion, itching, and runny nose.\nHow to Use and Dosage:\nAdults: 2 sprays in each nostril twice d', 20, 403.00, 'https://beta.cruzverde.cl/dw/image/v2/BDPM_PRD/on/demandware.static/-/Sites-masterCatalog_Chile/default/dw5274b790/images/large/532172.1.jpg?sw=1000&sh=1000', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(151, 'Farcolin 20ml Inhaler Solution', 'Product Details:\n* FARCOLIN is a Respiratory Solution used to alleviate asthmatic attacks\n* Active ingredient: Salbutamol Sulphate 0.5%\n* Indication:\n- Helps keep airways in the lungs open, making it easier to breathe.\n- Relieves chest tightness, wheezing', 19, 37.00, 'https://makeyya.com/wp-content/uploads/2024/06/inPixioAI_image_3878.jpeg', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(152, 'Symbicort 320/9mcg 60Dose Turbuhaler', 'Product Details:\nSymbicort Turbuhaler 320/9mcg/Dose Is An Inhaler Medication Designed To Help Manage Asthma And Chronic Obstructive Pulmonary Disease (COPD).\n-It Contains Budesonide 320mcg/Inhalation &\nFormoterol Fumarate 9mcg/Inhalation\n-This Inhaler Is ', 19, 432.00, 'https://tdawi.com/media/catalog/product/cache/c02fd180406f0a5f799ad7095a14ddcd/s/y/symbicort_320-9_1__dpwqwkskgzn6phxy.jpg', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(153, 'Flixotide 50mcg 120Dose Evohaler', 'Product Details:\nActive Ingredient: Fluticasone Nasal\nRx products:\nAllergic rhinitis (Veramyst, Avamys |Canadian product], Flonase [Canadian product]):\nManagement of seasonal and perennial allergic rhinitis in adults and children ?2 years of age (Veramyst', 19, 111.00, 'https://www.rightbreathe.com/wp-content/uploads/2016/06/flixotide-evohaler-50-10b.jpg', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(154, 'Broncho Vaxom Adult 10 Capsules', 'Product Details:\n* Broncho Vaxom Adult 10 Capsules are used for the prevention of diseases of the respiratory tract.\n* Active ingredient: Bacterial Lysate 7mg.\n* Indication: It helps to improve and increase immunity and prevents recurrent bacterial or vir', 19, 217.00, 'https://f.fcdn.app/imgs/14adfd/www.sanroque.com.uy/sanruy/edad/original/catalogo/588_588_1/460x460/broncho-vaxom-adultos-x-10-cap-broncho-vaxom-adultos-x-10-cap.jpg', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(155, 'Azelast Plus (125/50)mcg Nasal Spray 120 Dose', 'Product Details:\n* Nasal Spray contains: Azelastine 125 mcg /\nFluticasone 50 mcg in 25 ml\n* Uses: relieve seasonal allergy symptoms of the nose such as stuffy/runny nose, itching, sneezing, and post-nasal drip.\n* How to use nasal spray? Gently blow your n', 19, 102.00, 'http://www.bloompharmacy.com/cdn/shop/products/azelast-plus-25-ml-847974.jpg?v=1695920355', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(156, 'Allear 5mg 20 Tablet', 'Product Details:\n* Allear 5mg tablets are used for the treatment of allergies.\n* Active ingredient: Levocetirizine dihydrochloride 5mg.\n* Indication: Relief of symptoms associated with allergic rhinitis and urticaria, including sneezing, runny nose, itchi', 19, 78.00, 'https://re3ayapharmacy.com/cdn/shop/files/allear-5-mg-20-tablets-325322.jpg?v=1735257783&width=600', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(157, 'Telfast Decongestant 60mg 10 Extend Relese Tablet', 'Product Details:\n* Telfast Decongestant Extended Release tablets are used for the relief of nasal congestion and allergy symptoms.\n* Active Ingredients: Fexofenadine Hydrochloride 60mg, Pseudoephedrine Hydrochloride 120mg.\n* Indication: Relief of symptoms', 19, 63.00, 'https://zenithpharmacy.com.au/cdn/shop/products/Telfast-60mg-Tablets-10-1_1.jpg?v=1703034028', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(158, 'Histazine-110mg 20 Tablet', 'Product Details:\nHISTAZINE-110 mg Tablets is a non-sedating antihistamine used to treat allergy symptoms and urticaria, while supporting respiratory health. It helps relieve symptoms of allergic rhinitis and common cold such as sneezing, runny or blocked ', 19, 68.00, 'https://cdn.chefaa.com/filters:format(webp)/public/uploads/products/histazine-1-10-mg-10-tab-01724148010.png', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(159, 'Floracerta 5mg 20 Orally Dispersible Tablets', 'Product Details:\n•FLORACERTA is an antihistamine medication designed to alleviate symptoms associated with allergies.\n* Ingredients: Each tablet contains 5mg of Levocetirizine.\n* Indications:\n- Relief of symptoms due to hay fever or other respiratory alle', 19, 66.00, 'https://taypharmacies.com/wp-content/uploads/2024/08/2024-08-11T111912.964.png', '2025-11-25 02:51:37.000000', NULL, NULL, 0, NULL),
(160, 'Vichy Dercos Antidandruff For Normal & Oily Hair Shampoo 200ml', 'Product Details:\nVichy Laboratoires Empower All Women And Men To Maximize Their Skin An Scalp Health At Every Stage Of Life.\nRecommended By 50,000 Dermatologists\nVichy\'s Dercos Anti-Dandruff Shampoo For Normal To Oily Hair Introduces A Groundbreaking Form', 21, 720.00, 'https://static.beautytocare.com/cdn-cgi/image/width=1600,height=1600,f=auto/media/catalog/product/v/i/vichy-dercos-anti-dandruff-ds-shampoo-for-normal-to-oily-hair-200ml_3_2.jpg', '2025-11-25 02:52:23.000000', NULL, NULL, 0, NULL),
(161, 'Capixy Anti Hair Loss Sulfate Free Shampoo 250ml', 'Product Details:\nAnti hair loss shampoo from CAPIXY designed to prevent hair loss and promote healthier hair growth. Ideal for all hair types, it is a Sulfate-free and paraben-free formula, stimulates keratin production, regulates scalp sebum production a', 21, 275.00, 'https://feel22.com/cdn/shop/files/BestOftemplate2023_5_5404a2e7-2b19-4b33-886b-555c902756fb.png?v=1704617329', '2025-11-25 02:52:23.000000', NULL, NULL, 0, NULL),
(162, 'Loreal Extraordinary Nourishing Norm Shampoo 200ml', 'Product Details:\nElvive ExtraOrdinary oils Shampoo is for normal hair with tendency to dry transforms lifeless hair to soft and lustrous For best results, use Elvive Extraordinary Oil shampoo and conditioner together. Directions: Apply on wet hair, massag', 21, 115.00, 'https://cdn.grofers.com/da/cms-assets/cms/product/09ad0371-bf44-498e-9736-2829732ba9cd.jpg?ts=1731587984', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(163, 'Clear Men 3xl With Activated Charcoal 180ml', 'Product Details:\nA powerful all-in-one solution for men\'s grooming, Clear Men 3-in-1 combines a shampoo, shower gel, and face wash in a single convenient formula.\nInfused with activated charcoal, it deep cleanses hair, body, and face, removing dirt, oil, ', 21, 95.00, 'http://jebnalak.com/cdn/shop/files/blackfridayoffers-2024-01-20T184507.724_1024x1024.png?v=1705765628', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(164, 'Clary With Procapil Dry&Damaged Hair Shampoo 300ml', 'Product Details:\nCLARY\'s Shampoo contains hydrating materials such as; Castor Oil, heat protein, Argan Oil and Vital Hair & Scalp Complex, All these ingredients work together to prevent damage, splitting and breakage.\nCLARY Shampoo contains hydrating mate', 21, 300.00, 'https://f.nooncdn.com/p/pzsku/ZBB3A1ADAA4E48DDCA826Z/45/1741005205/a2f589d4-e98a-4ad8-8cb1-01ce84408dcd.jpg?width=1200', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(165, 'Selengena Antidandruff Shampoo 120ml', 'Product Details:\n•Anti Dandruff Shampoo\n•Treats Hair Dandruff\n•Apply Selengena Hair Shampoo Once Weekly With Gentle Massage To The Scalp 2-3 Minutes For Not Less Than 2 Month', 21, 105.00, 'https://eparkville.com/cdn/shop/products/NewProject-31-f40ca9a2-16e7-47ad-848d-b836d4c19a06-_1_53e2e3e3-799d-46f0-8634-4913d7d3f6cb-355137.jpg?v=1746964749&width=900', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(166, 'Bionnex Organica Anti Dandruff and Loss Shampoo 300ml', 'Product Details:\nBIONNEX Organica anti dandruff and Loss shampoo prevent hair loss, nourish hair follicles, and promote healthier, more vibrant hair. With its plant-based formula, rich in vitamins and minerals, it hydrates, revitalizes, and strengthens ha', 21, 459.00, 'https://www.yallapick.com/storage/app/public/product/1735044224-Bionnex-Organica-Anti-Hair-Loss-Shampoo-for-Normal-Hair-300ml.jpg', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(167, 'Loreal Elvive Total Repair (5) Conditioner 200ml', 'Product Details:\nHelps restore 5 visible signs of replenished hair:\n1. Stronger.\n2. Smoother\n3. Shinier.\n4. Thicker\n5. Repaired ends. DIRECTIONS: Apply on wet hair, massage gently the entire scalp then rinse. For Full Care: Use Total Repair 5 Shampoo, Mas', 21, 118.00, 'http://www.bloompharmacy.com/cdn/shop/products/loreal-elvive-conditioner-total-repair-5-200ml-660568.jpg?v=1687635768', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(168, 'Eva Aloe Eva with Aloe Vera & Argan Conditioner 230ml', 'Product Details:\nStrenghtening Hair Conditioner for a deeply moisturized & softer hair with no frizz, for split ends and frizzy hair.', 21, 75.00, 'https://zynah.me/cdn/shop/files/AloeEvaStrengtheningConditioner_AloeVera_MoroccanArganOil_ZYNAH_1024x1024.jpg?v=1694426641', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(169, 'Clary With Procapil Dry&Damaged Hair Conditioner 300ml', 'Product Details:\nCLARY hair Conditioner is specifically designed to combat dryness and nourish dry, damaged hair, It deeply nourishes the scalp and strands, leaving the hair soft, shiny, and revitalized.\nEnriched with Olive Oil, Caviar Extract, and Shea B', 21, 320.00, 'https://girls-house.com/wp-content/uploads/2024/11/21.webp', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(170, 'Wellwoman Original 60 Tablets', 'Description :\n* Wellwoman Original Tablets are used as a comprehensive multivitamin for women.\n* Active ingredients: Contains a spectrum of micronutrients including Biotin, Niacin (Vit. B3), Zinc, Riboflavin (Vit. B2), Vitamin B6, B12, Iron, and Folic Aci', 25, 260.00, 'https://images-cdn.ubuy.ae/6681200c8327e90f282d1769-wellman-wellwoman-original-60.jpg', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(171, 'Ova Women 60 Film Coated Tablets', 'Description :\nOva Women is a dietary supplement designed to support natural female fertility, regulate hormonal balance, and improve reproductive health, especially in women with PCOS symptoms, irregular menstruation, or hormonal imbalances. It also contr', 25, 470.00, 'https://api.c0umyt3cda-pharmaove1-p1-public.model-t.cc.commerce.ondemand.com/medias/000000000000042003.webp?context=bWFzdGVyfGltYWdlc3wzMTM0MXxpbWFnZS9qcGVnfGFHVXpMMmd4WWk4eE1qSTBPVGt6TlRBeU1EQTJNaTh3TURBd01EQXdNREF3TURBd05ESXdNRE11ZDJWaWNBfDVmZjg2OTk2NDVkMzAyNDBiZDY4M2E1ZjVjNmIwM2Q1MzIzMDkyODcwYTc2OTY3MmFhMjkyMDZmN2M5NTVhYTA', '2025-11-25 03:48:49.000000', NULL, NULL, 0, NULL),
(172, 'WFS Plus Universal Fertility 180 Capsules', 'WFS Plus Universal Fertility 90 Capsules. Enhance ovarian function and improve the process of ovulation, which is crucial for a successful pregnancy.', 25, 5414.00, 'https://babamisr.com/public/uploads/all/HK7hDz0Cx35BPMhBFAOKamoi3TXK3ypMvxrLhHFM.webp', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(173, 'Sanso Women 30 Film Coated Tablets', 'Sanso Women is used to provide essential vitamins and minerals that support women\'s overall health, energy levels, and well-being.\n* Active ingredients: A blend of vitamins (A, C, D, E, B6, B12) and minerals such as Iron, Calcium, Zinc, and more.\n* Indica', 25, 180.00, 'https://taypharmacies.com/wp-content/uploads/2024/05/2024-06-01T133301.937.png', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(174, 'NOW Eve For Women 90 Capsules', 'NOW Eve is a women\'s multivitamin supplement designed to support health, vitality, and energy. Active Ingredient: Multi Vitamins&Minerals', 25, 2200.00, 'https://onemg.gumlet.io/l_watermark_346,w_690,h_700/a_ignore,w_690,h_700,c_pad,q_auto,f_auto/02f136bbabf041899b0f3fdb421508a7.jpg', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(175, 'Pregtility Plus For Women 28 Sachets', 'PREGTILITY PLUS FOR WOMEN 28 SACHETS is a dietary supplement designed to support women\'s fertility. It enhances ovulation and improves egg health using a natural formula. Additionally, it helps manage insulin resistance and reduces the risk of developing ', 25, 700.00, 'https://eparkville.com/cdn/shop/files/002_grande.png?v=1750240450', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(176, 'Carnivita Advance Women 30 Sachets', 'Description:\nCarnivita Advance Women 30 Sachet is a dietary supplement designed to support female fertility.\n* Active ingredients: 1000 mg L-carnitine, 500 mg Acetyl L-Carnitine, 11 mg elemental Zinc, 27.5 mcg Selenium, 90 mg Vitamin C, 30 mg Vitamin E, 5', 25, 350.00, 'https://cdn.salla.sa/qVbqW/749e838d-f2d0-428d-8a1d-908204e8bf4e-1000x1000-XoppT9vuvHQFn9SKn0jQiBSegJTbgAjGgfDZTaDt.jpg', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(177, 'Deloitte Rose 20 Soft Gelatin Capsules', 'Deloitte Rose capsules are a dietary supplement designed to support women\'s general and hormonal health. \nHormonal Balance:  It is primarily used to support hormonal balance and alleviate symptoms associated with the menstrual cycle and menopause.', 25, 190.00, 'https://www.deloittepharma.com/web/image/2312-18570dc5/mockup%203D%20rose.webp', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(178, 'Femtonex 30 Film Coated Tablets', 'Description:\n* Femtonex is a dietary supplement formulated to support female reproductive health, normal infertility and hormonal balance.\n* Active ingredients: Myo-Inositol, D-Chiro Inositol, Zinc, folic acid, selenium and group of selected vitamins, min', 25, 300.00, 'https://taypharmacies.com/wp-content/uploads/2023/07/FEMTONEX-30-FILM-COATED-TAB.png', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(179, 'Elevit Pronatal 30 Film Coated Tablets', 'Elevit Pronatal is a multivitamin and mineral supplement designed to meet the increased nutritional needs of women who are trying to conceive, pregnant, and breastfeeding. It contains a combination of 12 vitamins, 3 minerals, and 4 trace elements to suppo', 25, 250.00, 'https://pharmazone.com/cdn/shop/files/12111-ELEVIT_PRONATAL_TABLETS_30_TAB_front_a21f3a92-b74e-40d5-8c93-d6df22d16bd2.webp?v=1746608480', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(180, 'Centrum Women 60 Film Coated Tablets', 'Centrum supplements are used to treat or prevent vitamin deficiencies caused by poor diet, certain illnesses, or during different life stages like pregnancy.\nComposition: They contain a range of vitamins and minerals tailored to different needs.', 25, 642.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/bp-wellness-centrum/en_AU/sliced-images/multivitamins/GSK_9310488003204PROD3-0.jpg?auto=format', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(181, 'Tamsulin Plus (0.4mg + 6mg) 20 Film', 'Product Details:\nActive Ingredient: Tamsulosin+Solifenacin\nSuccinate', NULL, 148.00, 'https://www.bloompharmacy.com/cdn/shop/products/tamsulin-plus-20-tablets-560504_1024x.jpg?v=1694883127', '2025-11-25 03:49:26.000000', NULL, NULL, 0, NULL),
(182, 'Trospamexin 20mg 20 Film', 'Product Details:\nActive Ingredient: Tropium Chloride', NULL, 80.00, 'https://www.bloompharmacy.com/cdn/shop/products/trospamexin-20-mg-20-tablets-916634_1024x.jpg?v=1707748099', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(183, 'Flowadjust 25mg 30 Extended Release tablets', 'Product Details:\nActive Ingredient: Mirabegron\nOveractive bladder: Treatment of overactive bladder (OAB) with symptoms of urinary frequency, urgency, or urge urinary incontinence', NULL, 306.00, 'https://taypharmacies.com/wp-content/uploads/2024/05/FLOWADJUST-25MG-30TAB.png', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(184, 'Sofenacin 5mg 30 Film coated tablet', 'Product Details:\n* SOFENACIN® 5mg tablets are used to treat symptoms associated with overactive bladder, including urinary urgency, frequency, and incontinence.\n* Each tablet contains 5mg of the active ingredient solifenacin succinate.\n* It is typically t', NULL, 141.00, 'https://www.rosheta.com/upload/748f64e0002ca4da416dd196743f6df2b3bda352a0c6134a555349ffdf6c3a31.webp', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(185, 'Cystone 60 Tablets', 'Product Details:\nActive Ingredient: Herbs', NULL, 98.00, 'https://www.himalaya.bg/userfiles/productlargeimages/product_2036.jpg', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(186, 'Dibavally 50mg 28 Tablets', 'Dibavally 50 mg 28 tablets is a prescription medication used for the treatment of type 2 diabetes mellitus in adults. It contains vildagliptin 50 mg as the active ingredient. Dosage: The typical daily dose for vildagliptin monotherapy is often 100 mg, usu', 26, 152.00, 'https://waelsamirpharma.com/public/uploads/all/3tPU0BkP6TGxz3NCMdkEM9q90DERGaSmAPCp7iBH.jpg', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(187, 'humalog Mix50 100U / ml3mlx5kwikpen(Refrigerated)', 'Humalog Mix50 100 U/mL is a premixed insulin suspension containing equal parts (50%) of rapid-acting insulin lispro and intermediate-acting insulin lispro protamine. It is used to improve blood sugar control in adults with type 1 or type 2 diabetes mellit', 26, 1237.00, 'https://kuludonline.com/cdn/shop/files/45404_medium.jpg?v=1746781947', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(188, 'Amaryl 1mg 30Tab', 'Active Ingredient: Glimepiride\nDiabetes mellitus, type 2: As an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus', 26, 40.00, 'https://lh6.googleusercontent.com/proxy/VGvWppr69Cgaa0TcM03THfOQ8g_MhBMOAHJecg6NsdklwT0YABfISBoN8HlXQIEtMqrGAu1G6fkfN1eyEJ_hGEPDU4yQ9kY-im_aTuY77y-uip3kKNaTC1OrLJo6pg', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(190, 'Galvus Met 50mg/850mg 30 Tablets', 'Galvus Met 50mg/850mg 30 Tablets is a prescription medication used to manage type 2 diabetes mellitus. It combines two active ingredients, vildagliptin (50 mg) and metformin hydrochloride (850 mg), to help control blood sugar levels. Dosage: The typical d', 26, 309.00, 'https://www.bloompharmacy.com/cdn/shop/products/galvus-met-50-mg-1000-mg-30-tablets-883101_600x600_crop_center.jpg?v=1687732647', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(191, 'Charnozam 30 Hard Gel Capsule', 'Charnozam Capsules are dietary supplement that contain a blend of natural ingredients designed to support digestive health and is used for flatulence, indigestion, and colic.\n* Active ingredients: Active Charcoal, Fennel, Anise, Caraway, Chamomile, and Gi', 27, 190.00, 'https://m.media-amazon.com/images/I/41dQ7r8nbrL._AC_UF1000,1000_QL80_.jpg', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(192, 'Enzymax Duo Biotics 10 Capsules', 'ENZYMAX DUO BIOTICS 10 CAPSULES is a dietary supplement formulated with digestive enzymes and probiotics to support healthy digestion and gut flora balance.It is designed to relieve digestive issues such as bloating, abdominal discomfort, irritable bowel ', 27, 250.00, 'https://lh5.googleusercontent.com/proxy/uqV-RnYNvnLASE2PoWcBiDObg3P_LkC81J6qR7Wvz4HtmRJLlYmMRPF5ybVtHuT3gziIrgyuIWb-ySGgF27X5FhXOHFOFHgserEeRu7vBKU1fCfq_7R1nvRw5emkP4bFZQvO', '2025-11-25 03:49:55.000000', NULL, NULL, 0, NULL),
(193, 'Zarroprazole 40mg/1100mg 28 Hard Gelatin Capsules', 'ZARROPRAZOLE 40/1100MG CAPSULES are indicated for the treatment of gastric and duodenal ulcers, gastrosophageal reflux disease (GERD), and as part of combination therapy for Helicobacter pylori eradication to reduce the risk of ulcer recurrence.\nThe combi', 27, 190.00, 'https://cdn.supercommerce.io/sally/uploads/151320.webp', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(194, 'Bowelocare 7.5mg/ml Oral Drops 15ml', 'BOWELOCARE 7.5MG/ML ORAL DROPS 15ml is a stimulant laxative used to relieve constipation. It works by drawing water into the intestines and stimulating the colon, leading to bowel movements.\nHow to Use and Dosage:\n* Usual dose: 10 to 15 drops daily.\n* Dos', 27, 16.00, 'https://cdn-med-images.vezeeta.com/Products/297e4018-4c18-472d-ad7a-3905834e5b66.jpeg', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(195, 'Imoflora 2mg+125mg 20 Tablets', 'IMOFLORA is an anti diarrheal medication to manage frequent bowl movements.\n* Active ingredient: Loperamide 2mg +\nSimethicone 125mg\n* Indication: IMOFLORA is used to manage frequent bowel movements in:\n- Acute diarrhea & Chronic diarrhea (e.g., IBS, IBD)\n', 27, 64.00, 'https://taypharmacies.com/wp-content/uploads/2025/02/21.png', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(196, 'Night Calm 3mg 20 Film Coated Tablets', 'Product Details:\nNIGHT CALM 3mg is a hypnotic medication that contains the active ingredient Eszopiclone. It is used to treat insomnia and helps in:\nImproving sleep quality: Helps to fall asleep\nquickly and stay asleep longer.\nReducing nighttime awakening', 23, 105.00, 'https://tdawi.com/media/catalog/product/cache/c02fd180406f0a5f799ad7095a14ddcd/n/i/night_calm_3_mg_1__letzevf0r1n8szs0.jpg', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(197, 'Snoozipax 3mg 20 Film Coated Tablets', 'Product Details:\nSnoozipax 3mg 20 Film Coated Tablets', 23, 54.00, 'https://taypharmacies.com/wp-content/uploads/2025/04/2025-04-03T161446.593.png', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(198, 'Fosavance 70mg 2 Tablets', 'Product Details:\n* Tablets for the Treatment of Osteoporosis\n* Each tablet contains 70 mg of alendronate and 2800 international units of vitamin D.\n* The usual dose: one tablet once a week.\n* It should be used on an empty stomach (at least half an hour be', 24, 105.00, 'https://uploads.remediumapi.com/5ecc3e6a6af72c3ad4d4907b/12673/1fe4344ae78ef63870c29a339eecb994/2160.jpeg', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(199, 'Viscoplus Matrix 75mg / 3ml (2.5%)', 'Product Details:\nViscoplus Matrix Is 75Mg/3MI Viscoelastic Cross-Linked Sodium Hyaluronate 2.5% Solution For Injection In A Pre-Filled Syringe For Intra-Articular Injection For Osteoarthritis Treatment.\nIndications / Use\n* A Viscoelastic Supplement Or A R', 24, 6266.00, 'https://www.beautetrade.com/uploads/images/products/3/4/0015423001678582310-buy-viscoplus-gel-75_500.jpeg', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(200, 'Prolia 60mg 1 Prefilled Syringe (Refrigerated)', 'Product Details:\n* A ready-made injection for the treatment of osteoporosis for postmenopausal women and men at risk of bone fractures.\n* Each syringe contains 60 mg of denosumab.\n* Usual dose: One injection every 6 months or as determined by the attendin', 24, 5174.00, 'https://www.mountainside-medical.com/cdn/shop/files/Prolia-Denosumab-60-mg_mL-Prefilled-Syringe-Injection-by-Amgen_700x700.jpg?v=1725886109', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(201, 'systane ultra', 'ALCON Systane Ultra Preservative Free Multi Dose Lubricant Eye Drops for Dry Eyes, Fast Acting Dry Eye Relief - 10ml', 29, 50.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6IMT3aIppp33b0Z8KqBEEwaUTXifMciQ5uw&s', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(202, 'Systane Hydration 10m', 'used to relieve dry, irritated eyes by providing moisture and forming a protective layer', 29, 1000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMLwskR6pxmy_hHisctezDonqv_cLZde0vJQ&s', '2025-11-25 03:50:22.000000', NULL, NULL, 0, NULL),
(203, 'Zaditor Antihistamine Itch Relief Eye Drops', 'an over-the-counter (OTC), prescription-strength antihistamine eye drop used to provide temporary, long-lasting relief from itchy eyes caused by common allergens like pollen, dust, grass, animal hair, and dander.', 29, 250.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC4z55ZqzThyQ2wRnkYt1eMGUv2T14VI8t1w&s', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(204, 'Lastacaft Fast-Acting Eye Itch Relief Drops, 5 mL', 'LASTACAFT is an over-the-counter eye drop that provides once-daily relief for itchy eyes caused by allergies', 29, 400.00, 'https://images.cdn.retail.brookshires.com/zoom/00300234291053_C1C1.jpeg', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(205, 'Tobrex 0.3% Eye Drops 5 Ml', 'Tobrex (tobramycin ophthalmic solution) 0.3% is a topical antibiotic indicated in the treatment of external infections of the eye and its adnexa caused by susceptible bacteria. Tobramycin is a water-soluble aminoglycoside antibiotic active against a wide ', 29, 350.00, 'https://lemon.sa/image/cache/catalog/pharmacy/products/otc/Eye%20drops/TOBREX%20EYE%20DROPS%205%20ml-360x360.jpg', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(206, 'Remowax 5%', 'Remowax Ear Drop is a liquid solution which helps to soften, disperse and sometimes dissolve ear wax. Although ear wax drops can be an effective, self-sufficient treatment for ear wax, they are more often used before some other form of treatment for ear w', 30, 40.00, 'https://russkaya-apteka.com/wp-content/uploads/2020/08/removaks-5-kapli-ushnye-15-ml.-russkaya-apteka-sharm-el-shejh-dahab-hurgada-.jpg', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(207, 'Dewax', 'Ear drops.\nVery effective is removing excessive ear wax.\nHelp to clear ear cannel if it is blocked with wax.\nAct by breaking up and softening the blocked wax.\nEasy to use and removable.\nNon Toxic.\nSafe for all patient classes (Pregnant, lactating, young c', 30, 60.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUkqfK3A0MZPyhkiGFNyERtDRSub-ULDlOCw&s', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(208, 'Waxsol Ear Drops Solution 10ml', 'Waxsol is an ear drop solution that contains docusate sodium to soften and disperse ear wax, helping to clear a blocked ear canal', 30, 90.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH9MIevjYi_OexoxhaS-99R_khj1h9a7cKGg&s', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(209, 'Viotic ear drops 10 ml', 'used to treat external ear infections The usual dose is 2 to 3 drops twice daily or as directed by your doctor.works on treatinf bacterial infections caused by susciptible microorganisms', 30, 440.00, 'https://re3ayapharmacy.com/cdn/shop/files/viotic-ear-drops-10-ml-678545.jpg?v=1735258029&width=1445', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(210, 'Otal ear drops 5 ml', 'A fast-acting ear drop formula designed to relieve ear pain and reduce inflammation. It contains a combination of analgesic and local anesthetic ingredients that help soothe discomfort, ease pressure in the ear canal, and provide quick, targeted relief. S', 30, 560.00, 'https://souqaldawaa.com/wp-content/uploads/2022/10/3-6.jpg', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(211, 'FlexiCol Hydrocolloid Dressing', 'FlexiCol Hydrocolloid Dressing Dressing forms a gel to prevent sticking to wound Thin beveled edges reduce potential roll-off Conforms to difficult-to-dress body contours and is comfortable to wear Quick and easy to apply Secure initial adhesion Does not ', 19, 2.63, 'https://dylbs6e8mhm2w.cloudfront.net/productimages/500x500/EV48600000BX_MNL_1.JPG', '2025-11-25 03:50:53.000000', NULL, 50.00, 1, 5.25),
(212, 'Adesivo de tratamento Dr.Med Xeroform Petrolatum', 'Occlusive dressings seal the wound to block air and moisture — used in more serious trauma or chest wounds.', 19, 50.00, 'https://m.media-amazon.com/images/S/aplus-media-library-service-media/90fc966d-562f-4f85-845d-058d7a91070c.__CR0,0,625,1250_PT0_SX150_V1___.jpg', '2025-11-25 03:50:53.000000', NULL, NULL, 0, NULL),
(213, 'Curad Sterile Non-Adherent Pads', 'Curad Sterile Non-Adherent Pads 3 x 4 inch (Pack of 100) for gentle wound dressing and absorption without sticking,', 19, 90.00, 'https://m.media-amazon.com/images/I/51V5ZmtCVFL._SL1000_.jpg', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 90.00),
(214, 'Omnitape', 'Omnitape 10m x 5cm 1 unitate', 19, 85.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx-TuOEe4YLhExeUPId-cJU6Mb0vTc2Nnklw&s', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 85.00),
(215, 'COTTON CREPE BANDAGE', 'Stretchy bandage for wrapping limbs, securing dressings, or compression', 19, 105.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa7grLmk67y957xMknDr-MWqgZCMgIevdW-g&s', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 105.00),
(216, 'Attmu Hot Water Bottle', 'Attmu Hot Water Bottle with Cover Knitted, Transparent Hot Water Bag 2 Liter - Blue', 19, 100.00, 'https://i.pinimg.com/474x/7a/f2/e3/7af2e37caccfb151c1f3d2ba035fbcaf.jpg', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 100.00),
(217, 'Burn Gel Tube', 'Burn Gel Tube 50g - After Sun', 19, 110.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdXZLJWrrxTLWLYyeC-mEHSBNFeeN6XuKesQ&s', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 110.00),
(218, '10Pcs Ordinary Grade Absorbent Cotton', '10Pcs Ordinary Grade Absorbent Cotton 10 Pieces Per Bag Self-sealing Cotton First Aid Kit Disposable', 19, 75.00, 'https://bubblesegypt.com/wp-content/uploads/2025/06/6223012843340-%D9%88%D8%B3%D8%A7%D8%AF%D8%A9-%D8%A7%D9%84%D8%AB%D8%AF%D9%89-%D8%A8%D8%A7%D8%A8%D9%84%D8%B2-10-%D9%82%D8%B7%D8%B9%D8%A9-1024x1024.jpg', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 75.00),
(219, 'Dealmed Nitrile Gloves', 'Dealmed Nitrile Gloves – Disposable Nitrile Gloves, Non-Irritating Latex Free, Multi-Purpose Use for a First Aid Kit', 19, 120.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX-9LQSmziqi8UZNzbxQPkK_ymSqS0CO3G0w&s', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 120.00),
(220, 'instant cold pack', 'instant cold packs _ 2 pack', 19, 200.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPrV9Oa5Wv3KYCZBTVwbj7-QD99cBttzdF0Q&s', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 200.00),
(221, 'Etoricox-Hexal 90mg 30 Film Coated Tablet', 'ETORICOX HEXAL 90MG TABLETS is a selective COX-2 inhibitor used in adults and adolescents to relieve pain and inflammation caused by osteoarthritis, rheumatoid arthritis, ankylosing spondylitis, acute gout, and dental surgery.\nHow to use:\n* The usual dose', 19, 306.00, 'https://waelsamirpharma.com/public/uploads/all/cB8DgFVUlDgLtwytdW96vqLusAxSVrB7uidhWK56.jpg', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 306.00),
(222, 'Rumaximap 60mg 30 Film Coated Tablet', 'RUMAXIMAP 60MG TABLETS is a selective COX-2 inhibitor used in adults and adolescents to relieve pain and inflammation caused by osteoarthritis, rheumatoid arthritis, ankylosing spondylitis, acute gout, and dental surgery.\nHow to use:\n* The usual dose is 6', 28, 147.00, 'https://api.c0umyt3cda-pharmaove1-p1-public.model-t.cc.commerce.ondemand.com/medias/000000000000031441.webp?context=bWFzdGVyfGltYWdlc3wxNzc2OXxpbWFnZS9qcGVnfGFERXpMMmc0T0M4eE1UTTFOekF3TnpVME5ETTFNQzh3TURBd01EQXdNREF3TURBd016RTBOREV1ZDJWaWNBfGQzYjBiNjYwMDQyMTFiMzAxN2U2YmQ3N2YwMmE4YmI5YzlhZWJhODQ1YmMwMGQ4ZjllNTE1NGM0MDAyM2U5YTE', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 147.00),
(223, 'Neo Move On Freeze Gel 50ml', 'Neo Move On Freeze Gel 50ml is a pain relieving gel for joints and muscles.\n* Active ingredients: Menthol, Eucalyptus and Camphor.\n* Indication: Used for pain relief in joints and muscles.\n* Dose: Apply to the affected area as needed or as prescribed by t', 28, 210.00, 'https://f.nooncdn.com/p/pzsku/ZDB17E25E826C1580912DZ/45/_/1716481013/dc5a0596-a732-40e0-add7-322a185f0831.jpg?width=480', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 210.00),
(224, 'Stopadol Forte 1000mg 10 Sachet', 'Stopadol Forte 1000mg sachets are used for pain relief and reducing fever.\n* Active ingredient: Paracetamol 1000mg.\n* Indication: Relief of conditions such as headache, muscle aches, arthritis, backache, toothache, colds, and fever.\n•Dose: Dissolve the co', 28, 60.00, 'https://taypharmacies.com/wp-content/uploads/2023/01/STOPADOL-FORTE-1000-MG-10-SACHETS.jpg', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 60.00),
(225, 'Sensodyne Toothpaste Multi-Care + Whitening 100ml', 'Sensodyne Multi Care + Whitening formula works 24/7 to give you tooth sensitivity protection. It builds soothing protection around the nerve, deep inside the tooth so you don\'t worry when you eat or drink. Clinically proven sensitivity relief*.', 28, 80.00, 'https://f.nooncdn.com/p/pnsku/N40840205A/45/_/1758196726/59f52542-5d81-41b7-a0aa-502680478f91.jpg?width=800', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 80.00),
(226, 'Listerine Antiseptic Mouthwash - Fresh Burst 250ml', 'USED TWICE DAILY, LISTERINE® FRESH BURST PROVIDES 24 HOUR PROTECTION AGAINST PLAQUE, GIVES LASTING FRESH BREATH CONFIDENCE AND FIGHTS BACTERIA', 31, 120.00, 'https://f.nooncdn.com/p/v1689242168/N20450101A_1.jpg?width=800', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 120.00),
(227, 'Oral-B Classic Soft 1 Toothbrush - Multicolors', 'a manual toothbrush designed for adults, featuring soft, end-rounded bristles that are gentle on teeth and gums while effectively removing plaque.', 31, 90.00, 'https://f.nooncdn.com/p/pzsku/ZCB72CCDCCF4467DFC7F0Z/45/1753369741/b82627eb-ec72-4cc9-8b6d-0746c30c0898.jpg?width=800', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 90.00),
(228, 'Fluoro Kids Tooth Paste - Blueberry - 50gm', 'Fluoro Kids Blueberry toothpaste is a 50gm children\'s toothpaste designed to make brushing fun with a sweet blueberry flavor and a sparkle gel formula.', 31, 27.00, 'https://chancestoreegy.com/wp-content/uploads/2025/09/1-14.jpg', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 27.00),
(229, 'Essential Waxed Shred Resistant Dental Floss 50meter', 'Oral-B Essential Waxed Shred Resistant Dental Floss is a mint-flavored floss designed to remove plaque and food particles from between teeth and below the gumline, where a toothbrush can\'t reach', 31, 700.00, 'https://f.nooncdn.com/p/pnsku/N11293758A/45/_/1758786895/ed0fd56e-4449-4124-95f1-fa3a49bb506b.jpg?width=800', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 700.00),
(230, 'Orovex Liquid Mouth wash strawberry 250ml', 'Daily Mouth Wash with Strawberry flavor with long-lasting effect removal of bad breath.', 31, 125.00, 'https://f.nooncdn.com/p/pzsku/Z46C2469DD8FF8A78DD6BZ/45/1757832782/9390673e-bdf0-4597-9e44-41ec43e2fde8.jpg?width=800', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 125.00),
(231, '500ml Electric Toothbrush with Water Flosser 2 in 1 Dental Oral Irrigator for Travel and Home', 'The Flossing Toothbrush is a high-efficiency 2-in-1 portable oral irrigator, designed to deliver advanced dental care wherever you are. Whether at home, traveling, or staying in a hotel, this flosser ensures a powerful, hygienic clean with convenience and', 31, 3200.00, 'https://f.nooncdn.com/p/pzsku/Z54DB39F7BB0DFBDFC35DZ/45/1744706232/50ae70d7-6be6-4785-b56a-816051dc029e.jpg?width=800', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 3200.00),
(232, 'Eva Smokers Cleansing Tooth Powder With Miswak 40 grams', 'Eva smokers tooth powder helps to remove teeth stains and purifies mouth.', 31, 45.00, 'https://f.nooncdn.com/p/pzsku/Z1C8900C8214D73B80EC8Z/45/_/1736197990/bbb234ff-a301-4bda-b695-34c1bd500c5b.jpg?width=800', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 45.00),
(233, 'Eva Smokers E-line Mouth Spray With Menthol 20 Ml', 'This lightweight mouth spray is convenient for on-the-go use several times throughout the day and helps eliminate bad breath instantly.', 31, 65.00, 'https://www.shop.eva-cosmetics.com/cdn/shop/files/PHLMyly0hSL0ivXmWMwncZbpxT7Yq5U6gPUM250c.webp?v=1759434106&width=450', '2025-11-25 04:20:45.000000', NULL, 0.00, 0, 65.00),
(234, 'Panadol Cold & Flu All In One Non-Drowsy 24 Tablets', 'Panadol Cold + Flu All in one tablet provide relives from cold + flu symptoms including chesty cough', 28, 475.00, 'https://i0.wp.com/healthy-vitamin.net/wp-content/uploads/2022/08/Panadol-Cold-Flu-All-In-One-Non-Drowsy-24-Tablets-1.jpg?w=1080&ssl=1', '2025-11-25 20:19:13.154330', 2, NULL, 0, NULL),
(243, 'Panadol Tablets', 'Helps fight everyday pains and for relieving fever.', 32, 50.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/health-professionals/en_PK/pain-relief/packshots/Panadol_regular_25_750X421.png?auto=format', '2025-11-26 06:05:53.000000', 2, 0.00, 0, 50.00),
(244, 'Panadol Extra', 'Dual active formulation that fights tough pains.', 32, 55.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/health-professionals/en_PK/pain-relief/packshots/Extra_25_750X421.png?auto=format', '2025-11-26 06:05:53.000000', 2, 0.00, 0, 55.00),
(245, 'Panadol for Children', 'Contains paracetamol, recommended for fever and mild-to-moderate pain in children.', 32, 40.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/health-professionals/en_PK/pain-relief/packshots/Panadol_Kids_25_750X421.png?auto=format', '2025-11-26 06:05:53.000000', 2, 0.00, 0, 40.00),
(246, 'Panadol Extend', 'Provides immediate release and pain relief.', 32, 65.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/health-professionals/en_PK/pain-relief/packshots/Extend_750X421.png?auto=format', '2025-11-26 06:05:53.000000', 2, 0.00, 0, 65.00),
(247, 'Panadol Night', 'Effective solution for night-time pain relief.', 32, 60.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/health-professionals/en_PK/pain-relief/panadol/panadol-night-750x421.png?auto=format', '2025-11-26 06:05:53.000000', 2, 0.00, 0, 60.00),
(248, 'Panadol Ultra', 'Fights pain two ways for stronger relief with Ibuprofen and Paracetamol.', 32, 70.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/health-professionals/en_PK/pain-relief/panadol/Panadol_ultra_750.png?auto=format', '2025-11-26 06:05:53.000000', 2, 0.00, 0, 70.00),
(249, 'Panadol CF', 'Provides effective relief from cold and flu symptoms.', 32, 55.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/health-professionals/en_PK/pain-relief/panadol/panadol-cf/Panadol-CF-packshot.png?auto=format', '2025-11-26 06:05:53.000000', 2, 0.00, 0, 55.00),
(250, 'Panadol CF Day', 'Day-time relief for cold and flu symptoms, with caffeine for synergy.', 32, 55.00, 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/health-professionals/en_PK/pain-relief/panadol/panadol-cf/Panadol-CF-day-packshot.png?auto=format', '2025-11-26 06:05:53.000000', 2, 0.00, 0, 55.00),
(251, 'Rexona Invisible Black & White Roll on Deodorant - 50 ml', 'Long-lasting protection with invisible black & white formula.', 33, 75.00, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/455666/1762676428/455666_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 75.00),
(252, 'Rexona Invisible Anti-Bacterial Protection Deodorant Spray for Men - 150ml', 'Anti-bacterial protection with invisible shield.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/h93/h79/64145274437662/497905_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(253, 'Rexona Women Antiperspirant Roll on Shower Fresh - 50ml', 'Fresh, long-lasting antiperspirant protection for women.', 33, 75.00, 'https://cdn.mafrservices.com/sys-master-root/h46/h77/49510743998494/334184_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 75.00),
(254, 'Rexona Men Spray - 150ml', 'Powerful all-day odor and sweat protection for men.', 33, 264.95, 'https://cdn.mafrservices.com/sys-master-root/h18/h10/64145283547166/590904_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 264.95),
(255, 'Rexona V8 Antiperspirant Deodorant Spray For Men - 150ml', 'High-performance V8 antiperspirant for men.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/h51/hea/64145273225246/410708_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(256, 'Rexona Shower Fresh Deodorant Spray - 150 ml', 'Fresh scent with long-lasting odor protection.', 33, 144.50, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/654790/1749729603/654790_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 144.50),
(257, 'Rexona Invisible Spray Black & White - 150ml', 'Invisible protection against white marks and yellow stains.', 33, 144.50, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/654794/1747740603/654794_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 144.50),
(258, 'Rexona V8 Antiperspirant Deodorant Spray For Men - 150ml', 'Comfortable long-lasting V8 formula.', 33, 144.50, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/654796/1748860204/654796_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 144.50),
(259, 'Rexona Mint Cool & Cedarwood - 150ml', 'Cool mint and cedarwood scent for long-lasting protection.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/h69/h52/64145284300830/591508_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(260, 'Rexona Charcoal Detox For Men - 150ml', 'Charcoal detox formula for deep odor protection.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/he0/h6f/64145282826270/591509_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(261, 'Rexona Peach Spark - 150ml', 'Peach spark scent with strong odor protection.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/h6f/h3a/49510826377246/591510_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(262, 'Rexona Roll on - Mint + Cedar Wood - 50ml', 'Refreshing mint and cedarwood scent in a roll-on.', 33, 75.00, 'https://cdn.mafrservices.com/sys-master-root/h48/h22/49510825721886/585246_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 75.00),
(263, 'Rexona Xtra Cool For Men - 150ml', 'Extra cool sensation with strong sweat protection.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/hb5/hbc/64145272700958/410709_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(264, 'Rexona Bamboo Motion Sense - 150ml', 'MotionSense technology with bamboo freshness.', 33, 144.50, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/654791/1749729603/654791_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 144.50),
(265, 'Rexona Women Shower Fresh - 150ml', 'Shower-fresh scent with effective sweat control.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/ha6/hda/49510747668510/410713_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(266, 'Rexona Bamboo Scent - 150ml', 'Refreshing bamboo scent for daily protection.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/hc9/h1a/49510825984030/591511_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(267, 'Rexona Antibacterial Invisible - 150ml', 'Invisible formula with antibacterial protection.', 33, 158.95, 'https://cdn.mafrservices.com/sys-master-root/h97/h90/49510751305758/497904_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 158.95),
(268, 'Rexona Mint Cool & Cedarwood - 150ml', 'Cool mint and cedarwood fragrance with sweat protection.', 33, 144.50, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/654797/1748860204/654797_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 144.50),
(269, 'Rexona Xtra Cool For Men - 150ml', 'Extra cool sensation for men with long-lasting performance.', 33, 144.50, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/654795/1748860204/654795_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 144.50),
(270, 'Rexona Peach + Lemongrass Roll on - 50ml', 'Peach and lemongrass-scented roll-on deodorant.', 33, 75.00, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/635402/1732527003/635402_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 75.00),
(271, 'Rexona Advanced Protection V8 For Men - 150ml', 'Advanced V8 protection technology for men.', 33, 151.35, 'https://cdn.mafrservices.com/sys-master-root/hea/ha8/64533583462430/635399_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 151.35),
(272, 'Rexona Invisible Black & White - 150ml', 'Invisible black & white protection to prevent stains.', 33, 151.35, 'https://cdn.mafrservices.com/sys-master-root/h20/h1b/49510825951262/585244_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 151.35),
(273, 'Rexona Roll on - Bamboo + Aloe - 50ml', 'Smooth bamboo and aloe-scented roll-on.', 33, 75.00, 'https://cdn.mafrservices.com/sys-master-root/h8c/h7b/49510748323870/420547_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 75.00),
(274, 'Rexona Men Roll on - Xtra Cool - 50ml', 'Men’s Xtra Cool protection in roll-on format.', 33, 75.00, 'https://cdn.mafrservices.com/sys-master-root/h89/h1e/49510825852958/585247_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 75.00),
(275, 'Rexona Charcoal Clean Roll On - 50ml', 'Charcoal clean formula roll-on deodorant.', 33, 75.00, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/654798/1748181603/654798_main.jpg?im=Resize=400', '2025-11-26 13:55:31.000000', 3, 0.00, 0, 75.00),
(276, 'Sensodyne Multi-Care and Whitening Toothpaste - 100 ml', 'Oral care product for sensitive teeth.', 33, 84.95, 'https://cdn.mafrservices.com/sys-master-root/hf0/hef/62583851286558/629195_1.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 10.00, 1, 94.95),
(277, 'Sensodyne Toothpaste Multi Care and Whitening - 100ml', 'Oral care product for sensitive teeth.', 33, 120.00, 'https://cdn.mafrservices.com/sys-master-root/hd6/h21/32851732103198/351217_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 120.00),
(278, 'Sensodyne Toothpaste Deep Clean Gel - 100 ml', 'Oral care product for sensitive teeth.', 33, 120.00, 'https://cdn.mafrservices.com/sys-master-root/h30/h20/32497126015006/480637_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 120.00),
(279, 'Sensodyne Extra Fresh Toothpaste - 100ml', 'Oral care product for sensitive teeth.', 33, 108.00, 'https://cdn.mafrservices.com/sys-master-root/h29/h5c/50684233056286/434516_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 108.00),
(280, 'Sensodyne Multi Care and Whitening Toothpaste - 50 Ml', 'Oral care product for sensitive teeth.', 33, 79.95, 'https://cdn.mafrservices.com/sys-master-root/h8f/h89/32496638525470/351219_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 79.95),
(281, 'Sensodyne Toothpaste Rapid Action - 75 ml', 'Oral care product for sensitive teeth.', 33, 109.00, 'https://cdn.mafrservices.com/sys-master-root/hd7/hf1/33383745159198/380224_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 109.00),
(282, 'Sensodyne Toothpaste Deep Clean Gel - 50 ml', 'Oral care product for sensitive teeth.', 33, 70.00, 'https://cdn.mafrservices.com/sys-master-root/hec/h61/32497127751710/480636_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 70.00),
(283, 'Sensodyne Toothpaste - Fluoride - 100 Ml', 'Oral care product for sensitive teeth.', 33, 108.00, 'https://cdn.mafrservices.com/sys-master-root/hf9/ha7/33383744274462/250998_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 108.00),
(284, 'Sensodyne Toothpaste - Fluoride - 50 Ml', 'Oral care product for sensitive teeth.', 33, 60.00, 'https://cdn.mafrservices.com/sys-master-root/he2/hcf/32496458891294/10071_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 60.00),
(285, 'Sensodyne Extra Fresh Toothpaste - 50ml', 'Oral care product for sensitive teeth.', 33, 60.00, 'https://cdn.mafrservices.com/sys-master-root/h6d/hf1/33383745191966/434515_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 60.00),
(286, 'Sensodyne Deep Clean Toothpaste - 50 Ml', 'Oral care product for sensitive teeth.', 33, 61.95, 'https://cdn.mafrservices.com/sys-master-root/h19/h38/51510080405534/621384_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 61.95),
(287, 'Sensodyne Deep Clean Toothpaste - 125 ml', 'Oral care product for sensitive teeth.', 33, 134.95, 'https://cdn.mafrservices.com/pim-content/EGY/media/product/640435/1728369604/640435_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 134.95),
(288, 'Sensodyne Multicare 1+1 Toothbrush for Sensitive Teeth - Medium', 'Toothbrush designed for sensitive teeth.', 33, 117.80, 'https://cdn.mafrservices.com/sys-master-root/h88/h1a/50684242526238/490651_main.jpg?im=Resize=400', '2025-11-26 14:14:50.000000', 4, 0.00, 0, 117.80);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `AdminId` int(11) DEFAULT NULL,
  `Subject` varchar(200) NOT NULL,
  `Content` varchar(2000) NOT NULL,
  `IsRead` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `ReadAt` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`Id`, `UserId`, `AdminId`, `Subject`, `Content`, `IsRead`, `CreatedAt`, `ReadAt`) VALUES
(1, 6, 2, 'Hello 🙋‍♂️', 'Welcome To our website ', 0, '2025-11-24 01:44:30.123775', NULL),
(2, 5, 2, 'Hello 🙋‍♂️', 'Welcome To our website ', 0, '2025-11-24 01:44:30.123800', NULL),
(3, 4, 2, 'Hello 🙋‍♂️', 'Welcome To our website ', 0, '2025-11-24 01:44:30.123801', NULL),
(4, 3, 2, 'Hello 🙋‍♂️', 'Welcome To our website ', 0, '2025-11-24 01:44:30.123801', NULL),
(5, 2, 2, 'Hello 🙋‍♂️', 'Welcome To our website ', 1, '2025-11-24 01:44:30.123801', '2025-11-25 19:51:36.018842'),
(6, 6, 2, 'Special Offer', '\n🎉 Special Offer: Use coupon code \"2IXLHGZU\" to get 0.5% OFF!', 0, '2025-11-24 02:07:29.156029', NULL),
(7, 5, 2, 'Special Offer', '\n🎉 Special Offer: Use coupon code \"2IXLHGZU\" to get 0.5% OFF!', 0, '2025-11-24 02:07:29.156058', NULL),
(8, 4, 2, 'Special Offer', '\n🎉 Special Offer: Use coupon code \"2IXLHGZU\" to get 0.5% OFF!', 0, '2025-11-24 02:07:29.156058', NULL),
(9, 3, 2, 'Special Offer', '\n🎉 Special Offer: Use coupon code \"2IXLHGZU\" to get 0.5% OFF!', 0, '2025-11-24 02:07:29.156059', NULL),
(10, 2, 2, 'Special Offer', '\n🎉 Special Offer: Use coupon code \"2IXLHGZU\" to get 0.5% OFF!', 1, '2025-11-24 02:07:29.156059', '2025-11-24 02:07:39.747971'),
(11, 6, 2, 'Congratulations', '\n\n🎉 Special Offer: Use coupon code \"VK3CW2RZ\" to get FREE SHIPPING!', 0, '2025-11-24 02:11:56.542613', NULL),
(12, 5, 2, 'Congratulations', '\n\n🎉 Special Offer: Use coupon code \"VK3CW2RZ\" to get FREE SHIPPING!', 0, '2025-11-24 02:11:56.542613', NULL),
(13, 4, 2, 'Congratulations', '\n\n🎉 Special Offer: Use coupon code \"VK3CW2RZ\" to get FREE SHIPPING!', 0, '2025-11-24 02:11:56.542613', NULL),
(14, 2, 2, 'Congratulations', '\n\n🎉 Special Offer: Use coupon code \"VK3CW2RZ\" to get FREE SHIPPING!', 1, '2025-11-24 02:11:56.542613', '2025-11-24 02:12:02.146704'),
(15, 6, 2, 'Hi Asma', 'Hi', 0, '2025-11-25 20:21:33.137909', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

CREATE TABLE `orderitems` (
  `Id` int(11) NOT NULL,
  `OrderId` int(11) NOT NULL,
  `MedicineId` int(11) NOT NULL,
  `BatchId` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `UnitPrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderitems`
--

INSERT INTO `orderitems` (`Id`, `OrderId`, `MedicineId`, `BatchId`, `Quantity`, `UnitPrice`) VALUES
(13, 40, 150, 70, 3, 403.00),
(14, 41, 150, 70, 1, 403.00),
(15, 42, 150, 70, 2, 403.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `Id` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `OrderDate` datetime(6) NOT NULL,
  `Status` varchar(50) NOT NULL,
  `TotalAmount` decimal(12,2) NOT NULL,
  `ShippingCost` decimal(65,30) NOT NULL DEFAULT 0.000000000000000000000000000000,
  `SubTotal` decimal(65,30) NOT NULL DEFAULT 0.000000000000000000000000000000,
  `CouponId` int(11) DEFAULT NULL,
  `DiscountAmount` decimal(12,2) DEFAULT NULL,
  `PurchaseSource` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`Id`, `UserId`, `OrderDate`, `Status`, `TotalAmount`, `ShippingCost`, `SubTotal`, `CouponId`, `DiscountAmount`, `PurchaseSource`) VALUES
(33, 2, '2025-11-23 00:04:33.417564', 'Refunded', 5.99, 0.000000000000000000000000000000, 0.000000000000000000000000000000, NULL, NULL, ''),
(34, 2, '2025-11-23 00:08:20.761428', 'Completed', 5.99, 0.000000000000000000000000000000, 0.000000000000000000000000000000, NULL, NULL, ''),
(35, 2, '2025-11-23 00:11:56.370474', 'Completed', 5.99, 0.000000000000000000000000000000, 0.000000000000000000000000000000, NULL, NULL, ''),
(36, 2, '2025-11-23 00:13:15.475014', 'Refunded', 8.47, 0.000000000000000000000000000000, 0.000000000000000000000000000000, NULL, NULL, ''),
(37, 2, '2025-11-23 00:36:33.176901', 'Completed', 5.99, 0.000000000000000000000000000000, 0.000000000000000000000000000000, NULL, NULL, ''),
(38, 2, '2025-11-24 01:52:07.233789', 'Completed', 28.99, 10.000000000000000000000000000000, 18.990000000000000000000000000000, NULL, NULL, ''),
(39, 2, '2025-11-24 02:08:23.365114', 'Cancelled', 28.90, 10.000000000000000000000000000000, 18.990000000000000000000000000000, 1, 0.09, ''),
(40, 2, '2025-11-25 20:24:03.196509', 'Refunded', 1204.00, 0.000000000000000000000000000000, 1209.000000000000000000000000000000, 2, 5.00, ''),
(41, 4, '2025-11-26 03:44:03.282583', 'Completed', 408.00, 5.000000000000000000000000000000, 403.000000000000000000000000000000, NULL, NULL, 'Website'),
(42, 2, '2025-11-26 03:46:35.919764', 'Completed', 811.00, 5.000000000000000000000000000000, 806.000000000000000000000000000000, NULL, NULL, 'Pharmacy');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `Id` int(11) NOT NULL,
  `OrderId` int(11) NOT NULL,
  `PaymentDate` datetime(6) NOT NULL,
  `Amount` decimal(12,2) NOT NULL,
  `Method` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`Id`, `OrderId`, `PaymentDate`, `Amount`, `Method`) VALUES
(6, 33, '2025-11-23 00:04:33.445304', 5.99, 'Cash'),
(7, 34, '2025-11-23 00:08:20.790192', 5.99, 'Cash'),
(8, 35, '2025-11-23 00:11:56.403293', 5.99, 'Cash'),
(9, 36, '2025-11-23 00:13:15.789870', 8.47, 'Cash'),
(10, 37, '2025-11-23 00:36:33.196773', 5.99, 'Card'),
(11, 38, '2025-11-24 01:52:07.315908', 28.99, 'Cash'),
(12, 39, '2025-11-24 02:08:23.452252', 28.90, 'Cash'),
(13, 40, '2025-11-25 20:24:03.284295', 1204.00, 'Cash'),
(14, 41, '2025-11-26 03:44:03.369208', 408.00, 'Cash'),
(15, 42, '2025-11-26 03:46:35.946320', 811.00, 'Cash');

-- --------------------------------------------------------

--
-- Table structure for table `refundrequests`
--

CREATE TABLE `refundrequests` (
  `Id` int(11) NOT NULL,
  `OrderId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `Reason` varchar(500) NOT NULL,
  `Status` varchar(50) NOT NULL,
  `RequestDate` datetime(6) NOT NULL,
  `ResponseDate` datetime(6) DEFAULT NULL,
  `RefundAmount` decimal(12,2) NOT NULL,
  `RefundMethod` varchar(50) DEFAULT NULL,
  `Notes` varchar(1000) DEFAULT NULL,
  `AdminId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refundrequests`
--

INSERT INTO `refundrequests` (`Id`, `OrderId`, `UserId`, `Reason`, `Status`, `RequestDate`, `ResponseDate`, `RefundAmount`, `RefundMethod`, `Notes`, `AdminId`) VALUES
(1, 33, 2, 'Wrong Item Received', 'Approved', '2025-11-24 01:21:54.228054', '2025-11-24 01:22:22.464250', 5.99, 'Cash', NULL, 2),
(2, 36, 2, 'Changed My Mind', 'Approved', '2025-11-24 01:23:48.897122', '2025-11-24 01:24:13.302462', 8.47, 'Original Payment Method', NULL, 2),
(3, 40, 2, 'Other', 'Approved', '2025-11-25 20:51:24.320432', '2025-11-25 20:58:33.616191', 1209.00, 'Original Payment Method', NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `supplierreturnrequests`
--

CREATE TABLE `supplierreturnrequests` (
  `Id` int(11) NOT NULL,
  `BatchId` int(11) NOT NULL,
  `MedicineId` int(11) NOT NULL,
  `SupplierId` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `Reason` varchar(200) NOT NULL,
  `Status` varchar(50) NOT NULL,
  `RequestDate` datetime(6) NOT NULL,
  `ResponseDate` datetime(6) DEFAULT NULL,
  `Notes` varchar(500) DEFAULT NULL,
  `NewBatchNumber` varchar(100) DEFAULT NULL,
  `NewExpiryDate` date DEFAULT NULL,
  `NewQuantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplierreturnrequests`
--

INSERT INTO `supplierreturnrequests` (`Id`, `BatchId`, `MedicineId`, `SupplierId`, `Quantity`, `Reason`, `Status`, `RequestDate`, `ResponseDate`, `Notes`, `NewBatchNumber`, `NewExpiryDate`, `NewQuantity`) VALUES
(13, 73, 151, 4, 100, 'Near Expiry', 'Approved', '2025-11-25 20:12:20.476651', '2025-11-25 20:44:53.910482', NULL, 'New-farcolin', '2026-12-31', 100);

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `Id` int(11) NOT NULL,
  `Name` varchar(150) NOT NULL,
  `Email` varchar(150) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` varchar(300) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`Id`, `Name`, `Email`, `Phone`, `Address`) VALUES
(1, 'PharmaCorp International', 'contact@pharmacorp.com', '+1-800-555-0101', '123 Pharma Street, Medical City, MC 12345'),
(2, 'MedSupply Co.', 'sales@medsupply.com', '+1-800-555-0102', '456 Health Avenue, Wellness District, WD 67890'),
(3, 'Global Pharmaceuticals', 'info@globalpharma.com', '+1-800-555-0103', '789 Medicine Boulevard, Pharma Park, PP 54321'),
(4, 'BioMed Solutions', 'orders@biomed.com', '+1-800-555-0104', '321 Science Drive, Research Center, RC 98765'),
(5, 'HealthFirst Distributors', 'support@healthfirst.com', '+1-800-555-0105', '654 Care Lane, Medical Plaza, MP 11223'),
(6, 'Unilver', 'Unilver@gmailcom', '01010101010', 'Egypt,Cario');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Role` varchar(50) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `PurchaseCount` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id`, `FullName`, `Email`, `PasswordHash`, `Phone`, `Role`, `CreatedAt`, `PurchaseCount`) VALUES
(2, 'Admin User', 'admin@pharmacy.com', '$2a$11$lemZ55nydRNPfVV1jx7/IeXpGtC.7cP76sRF4wHfiRvEXBIjDNpIm', '+1234567890', 'Admin', '2025-11-19 01:24:47.653178', 22),
(3, 'John Pharmacist', 'pharmacist@pharmacy.com', '$2a$11$KVSeeLcS3oWBmD7jKnOSyOhh9uTE32Y3avxOOHw1FcL/zp2GDDq/W', '+1234567891', 'Pharmacist', '2025-11-19 01:24:47.820023', 0),
(4, 'Sarah Customer', 'customer@example.com', '$2a$11$WUb0ehdcUoTlx2sOytZc/u/pZCpKAlOr.hnDJNw/ccMySPsdL5AiW', '+1234567892', 'Customer', '2025-11-19 01:24:47.985215', 1),
(5, 'Marwan farook', 'mike@example.com', '$2a$11$NX7l10KSuaj7UC8.mrncTuV8EDZKoOXZuTtPqFuPtfH21bH7mgHAu', '+1234567893', 'Customer', '2025-11-19 01:24:48.151593', 0),
(6, 'Asma', 'Asma@gmail.com', '$2a$11$VN1bdmebAXW2dgF5gHy2YugDpc2NzEAkajxXwCgV6BRW/6AJMBbwm', '01020483849', 'Customer', '2025-11-21 23:42:44.152348', 0);

-- --------------------------------------------------------

--
-- Table structure for table `__efmigrationshistory`
--

CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `__efmigrationshistory`
--

INSERT INTO `__efmigrationshistory` (`MigrationId`, `ProductVersion`) VALUES
('20251119010905_InitialCreate', '8.0.0'),
('20251119122949_AddHasDiscountToMedicine', '8.0.0'),
('20251119124219_AddPurchaseCountToUser', '8.0.0'),
('20251119215449_AddBillTable', '8.0.0'),
('20251120134054_AddCreatedAtToMedicine', '8.0.0'),
('20251121141829_AddSupplierReturnRequests', '8.0.0'),
('20251121145245_FixSupplierReturnRequestRelationships', '8.0.0'),
('20251121152221_AddIsHiddenToMedicineBatches', '8.0.0'),
('20251121212749_RemoveHasDiscountFromMedicine', '8.0.0'),
('20251121214455_AddSupplierReturnRequestsTable', '8.0.0'),
('20251122233105_RemoveStatusFromPayments', '8.0.0'),
('20251123005758_AddBrandTableAndBrandIdToMedicine', '8.0.0'),
('20251123020140_AddBannerImagesTable', '8.0.0'),
('20251124011141_AddRefundRequestsTable', '8.0.0'),
('20251124013822_AddMessagesTable', '8.0.0'),
('20251124015044_AddShippingCostToOrder', '8.0.0'),
('20251124020334_AddCouponSystem', '8.0.0'),
('20251124022958_AddCommentsTable', '8.0.0'),
('20251124024246_AddItemTypeToMedicine', '8.0.0'),
('20251124035305_AddProductExpiryAlertTable', '8.0.0'),
('20251124122409_UpdateProductExpiryAlertRemoveCouponAddHasDiscount', '8.0.0'),
('20251124124524_AddHasDiscountToMedicineTable', '8.0.0'),
('20251124143921_AddOriginalPriceToMedicine', '8.0.0'),
('20251124155826_AddDiscountFieldsToMedicine', '8.0.0'),
('20251126034130_AddPurchaseSourceToOrder', '8.0.0');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bannerimages`
--
ALTER TABLE `bannerimages`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_isactive` (`IsActive`),
  ADD KEY `idx_displayorder` (`DisplayOrder`);

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Bills_BillNumber` (`BillNumber`),
  ADD KEY `IX_Bills_OrderId` (`OrderId`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `cartitems`
--
ALTER TABLE `cartitems`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_CartItems_CartId` (`CartId`),
  ADD KEY `IX_CartItems_MedicineId` (`MedicineId`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Carts_UserId` (`UserId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Comments_MedicineId` (`MedicineId`),
  ADD KEY `IX_Comments_UserId` (`UserId`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Coupons_Code` (`Code`),
  ADD KEY `IX_Coupons_CreatedByAdminId` (`CreatedByAdminId`);

--
-- Indexes for table `expiryalerts`
--
ALTER TABLE `expiryalerts`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_ExpiryAlerts_BatchId` (`BatchId`);

--
-- Indexes for table `medicinebatches`
--
ALTER TABLE `medicinebatches`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_MedicineBatches_MedicineId` (`MedicineId`),
  ADD KEY `IX_MedicineBatches_SupplierId` (`SupplierId`);

--
-- Indexes for table `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Medicines_CategoryId` (`CategoryId`),
  ADD KEY `IX_Medicines_BrandId` (`BrandId`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Messages_AdminId` (`AdminId`),
  ADD KEY `IX_Messages_UserId` (`UserId`);

--
-- Indexes for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_OrderItems_BatchId` (`BatchId`),
  ADD KEY `IX_OrderItems_MedicineId` (`MedicineId`),
  ADD KEY `IX_OrderItems_OrderId` (`OrderId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Orders_UserId` (`UserId`),
  ADD KEY `IX_Orders_CouponId` (`CouponId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_Payments_OrderId` (`OrderId`);

--
-- Indexes for table `refundrequests`
--
ALTER TABLE `refundrequests`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_RefundRequests_AdminId` (`AdminId`),
  ADD KEY `IX_RefundRequests_OrderId` (`OrderId`),
  ADD KEY `IX_RefundRequests_UserId` (`UserId`);

--
-- Indexes for table `supplierreturnrequests`
--
ALTER TABLE `supplierreturnrequests`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `IX_SupplierReturnRequests_BatchId` (`BatchId`),
  ADD KEY `IX_SupplierReturnRequests_MedicineId` (`MedicineId`),
  ADD KEY `IX_SupplierReturnRequests_SupplierId` (`SupplierId`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_Users_Email` (`Email`);

--
-- Indexes for table `__efmigrationshistory`
--
ALTER TABLE `__efmigrationshistory`
  ADD PRIMARY KEY (`MigrationId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bannerimages`
--
ALTER TABLE `bannerimages`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `bills`
--
ALTER TABLE `bills`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `cartitems`
--
ALTER TABLE `cartitems`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `expiryalerts`
--
ALTER TABLE `expiryalerts`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `medicinebatches`
--
ALTER TABLE `medicinebatches`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `medicines`
--
ALTER TABLE `medicines`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=289;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `refundrequests`
--
ALTER TABLE `refundrequests`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `supplierreturnrequests`
--
ALTER TABLE `supplierreturnrequests`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `FK_Bills_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `cartitems`
--
ALTER TABLE `cartitems`
  ADD CONSTRAINT `FK_CartItems_Carts_CartId` FOREIGN KEY (`CartId`) REFERENCES `carts` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_CartItems_Medicines_MedicineId` FOREIGN KEY (`MedicineId`) REFERENCES `medicines` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `FK_Carts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `FK_Comments_Medicines_MedicineId` FOREIGN KEY (`MedicineId`) REFERENCES `medicines` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_Comments_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `coupons`
--
ALTER TABLE `coupons`
  ADD CONSTRAINT `FK_Coupons_Users_CreatedByAdminId` FOREIGN KEY (`CreatedByAdminId`) REFERENCES `users` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `expiryalerts`
--
ALTER TABLE `expiryalerts`
  ADD CONSTRAINT `FK_ExpiryAlerts_MedicineBatches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `medicinebatches` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `medicinebatches`
--
ALTER TABLE `medicinebatches`
  ADD CONSTRAINT `FK_MedicineBatches_Medicines_MedicineId` FOREIGN KEY (`MedicineId`) REFERENCES `medicines` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_MedicineBatches_Suppliers_SupplierId` FOREIGN KEY (`SupplierId`) REFERENCES `suppliers` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `medicines`
--
ALTER TABLE `medicines`
  ADD CONSTRAINT `FK_Medicines_Brands_BrandId` FOREIGN KEY (`BrandId`) REFERENCES `brands` (`Id`) ON DELETE SET NULL,
  ADD CONSTRAINT `FK_Medicines_Categories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`Id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `FK_Messages_Users_AdminId` FOREIGN KEY (`AdminId`) REFERENCES `users` (`Id`) ON DELETE SET NULL,
  ADD CONSTRAINT `FK_Messages_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD CONSTRAINT `FK_OrderItems_MedicineBatches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `medicinebatches` (`Id`),
  ADD CONSTRAINT `FK_OrderItems_Medicines_MedicineId` FOREIGN KEY (`MedicineId`) REFERENCES `medicines` (`Id`),
  ADD CONSTRAINT `FK_OrderItems_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK_Orders_Coupons_CouponId` FOREIGN KEY (`CouponId`) REFERENCES `coupons` (`Id`) ON DELETE SET NULL,
  ADD CONSTRAINT `FK_Orders_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `FK_Payments_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `refundrequests`
--
ALTER TABLE `refundrequests`
  ADD CONSTRAINT `FK_RefundRequests_Orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`Id`),
  ADD CONSTRAINT `FK_RefundRequests_Users_AdminId` FOREIGN KEY (`AdminId`) REFERENCES `users` (`Id`) ON DELETE SET NULL,
  ADD CONSTRAINT `FK_RefundRequests_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`);

--
-- Constraints for table `supplierreturnrequests`
--
ALTER TABLE `supplierreturnrequests`
  ADD CONSTRAINT `FK_SupplierReturnRequests_MedicineBatches_BatchId` FOREIGN KEY (`BatchId`) REFERENCES `medicinebatches` (`Id`),
  ADD CONSTRAINT `FK_SupplierReturnRequests_Medicines_MedicineId` FOREIGN KEY (`MedicineId`) REFERENCES `medicines` (`Id`),
  ADD CONSTRAINT `FK_SupplierReturnRequests_Suppliers_SupplierId` FOREIGN KEY (`SupplierId`) REFERENCES `suppliers` (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
