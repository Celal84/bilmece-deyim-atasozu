// ===== 9 YAŞ SEVİYESİ: ek ve daha zor içerik =====
const HARD0 = { bil: BILMECE.length, dey: DEYIM.length, ata: ATASOZU.length, tek: TEKERLEME.length, fik: FIKRA.length };

// grup: y yiyecek/bitki, h hayvan, e eşya, d doğa/uzay/yer, v vücut, k dil
BILMECE.push(
["Kuyruğu var ama hayvan değildir. Rüzgârla havalanır, ipi hep elimizdedir.","Uçurtma","🪁","e"],
["Dişleri var ama ısırmaz. Çanta ve montların ağzını açıp kapatır.","Fermuar","🧥","e"],
["İğnesi hep aynı yöne bakar. Yolunu kaybedenlerin en iyi arkadaşıdır.","Pusula","🧭","e"],
["Gözümüzün göremediği minik canlıları kocaman gösterir. Bilim insanlarının vazgeçilmezidir.","Mikroskop","🔬","e"],
["Çok uzaktaki yıldızları ve gezegenleri yakına getirir.","Teleskop","🔭","e"],
["Hasta olunca koltuğumuzun altına koyarız. Ateşimizi sayılarla söyler.","Termometre","🌡️","e"],
["Koca dünyayı bir kâğıda sığdırır. Yolumuzu bulmak için ona bakarız.","Harita","🗺️","e"],
["Binlerce kelimenin anlamını içinde saklar. Alfabe sırasına göre dizilidir.","Sözlük","📚","k"],
["Karelerden oluşan siyah beyaz bir tahtada oynanır. Şah, vezir, at ve fil onun taşlarıdır.","Satranç","♟️","e"],
["Türkçede sekiz tanedir: a, e, ı, i, o, ö, u, ü. Söylerken sesimiz hiçbir yere takılmaz. Bunlara ne denir?","Ünlü harfler","🔤","k"],
["Güneş sisteminin en büyük gezegenidir. Üzerinde yüzlerce yıldır süren dev bir fırtına var.","Jüpiter","🪐","d"],
["Etrafında buz ve kaya parçalarından oluşan parlak halkalar bulunan gezegendir.","Satürn","🪐","d"],
["Kızıl gezegen diye bilinir. Toprağındaki demir yüzünden kırmızı görünür.","Mars","🔴","d"],
["Güneş'e en yakın gezegendir ve en küçüğüdür.","Merkür","⚫","d"],
["Dünyanın en yüksek dağıdır. Zirvesine çıkmak için cesur dağcılar yıllarca hazırlanır.","Everest","⛰️","d"],
["Türkiye'nin en yüksek dağıdır. Doğu Anadolu'da yer alır, zirvesi hep karlıdır.","Ağrı Dağı","🏔️","d"],
["Türkiye'nin başkentidir. Anıtkabir bu şehirdedir.","Ankara","🏛️","d"],
["Türkiye'nin en uzun nehridir. Kırmızımsı suyuyla uzun yol gidip Karadeniz'e dökülür.","Kızılırmak","🏞️","d"],
["Önce o parlar, sonra gök gürler. Işığı hızlı olduğu için onu önce görürüz.","Şimşek","⚡","d"],
["Canlılar onsuz yaşayamaz. Isınınca buharlaşır, donunca buz olur.","Su","💧","d"],
["Dünyanın en büyük hayvanıdır. Denizde yaşar ama balık değil, memelidir.","Mavi balina","🐋","h"],
["Karlı yerlerde yaşar, yüzmeyi çok iyi bilir. Fok avlar, tüyleri beyaz görünür.","Kutup ayısı","🐻","h"],
["Memelidir ama uçar. Geceleri avlanır, karanlıkta sesin yankısıyla yolunu bulur.","Yarasa","🦇","h"],
["Uzun bacaklı, uzun gagalı bir kuştur. Kışın sıcak ülkelere göç eder, ilkbaharda çatıdaki yuvasına döner.","Leylek","🐦","h"],
["Çölde yaşar, yaprakları diken gibidir. Gövdesinde sakladığı suyla susuzluğa dayanır.","Kaktüs","🌵","y"],
["Sarı yapraklı kocaman bir çiçektir. Tohumlarından yağ çıkarılır, çerezi de yapılır.","Ayçiçeği","🌻","y"],
["Kat kat soyulur. Doğrarken gözlerimizi yaşartır, yemeklerin vazgeçilmezidir.","Soğan","🧅","y"],
["Göğsümüzün solunda durur. Hiç durmadan atar ve kanı bütün vücuda pompalar.","Kalp","❤️","v"],
["İki tanedir, göğsümüzde durur. Nefes alınca şişer, verince söner.","Akciğer","🌬️","v"],
["Kafatasının içinde durur. Düşünmemizi, hatırlamamızı ve hareket etmemizi yönetir.","Beyin","🧠","v"]
);

DEYIM.push(
["Gözden düşmek","Değerini ve saygınlığını kaybetmek","Yalan söyleyince arkadaşlarının {gözünden düştü}.","📉"],
["Eline su dökemez","Onunla kıyaslanamaz, ondan çok geridedir","Satrançta ona kimse {eline su dökemez}.","🥇"],
["Boynu bükük","Üzgün ve çaresiz","Maçı kaybedince {boynu bükük} eve döndü.","😞"],
["Dilinin ucunda olmak","Bildiği bir şeyi o an hatırlayıp söyleyememek","Şarkının adı {dilimin ucunda} ama bir türlü çıkaramıyorum.","🤔"],
["Gözü pek","Korkusuz, atılgan","{Gözü pek} bir çocuktu, karanlık odaya hemen girdi.","🦁"],
["Ayak uydurmak","Çevreye ve yeni duruma uyum sağlamak","Yeni okulunda arkadaşlarına çabuk {ayak uydurdu}.","🚶"],
["Göz yummak","Bir hatayı görmezden gelmek","Öğretmenimiz ilk hatama {göz yumdu}.","🙈"],
["Kulak asmamak","Söyleneni dinlememek, önemsememek","Uyarıya {kulak asmadı} ve yağmurda ıslandı.","🙉"],
["Taş çatlasa","Ne olursa olsun, en geç","{Taş çatlasa} yarın akşama kadar bitiririm.","🪨"],
["Pabucu dama atılmak","Değerini yitirip yerine başkasının geçmesi","Yeni oyuncu gelince eski kalecinin {pabucu dama atıldı}.","👞"],
["Parmak ısırmak","Çok şaşırmak, hayran kalmak","Resmini görenler {parmak ısırdı}.","😲"],
["El ele vermek","Birlikte, birbirine yardım ederek çalışmak","Sınıf olarak {el ele verip} bahçeyi temizledik.","🤝"],
["Can kulağıyla dinlemek","Çok dikkatle, bütün ilgisiyle dinlemek","Dedemin masalını {can kulağıyla} dinledik.","🎧"],
["Nam salmak","Ünlenmek, her yerde tanınmak","Yaptığı lezzetli baklavalarla {nam saldı}.","🏅"],
["Kıl payı","Çok az farkla, ucu ucuna","Düşmekten {kıl payı} kurtuldu.","😅"],
["Başa çıkmak","Bir zorluğun üstesinden gelmek","Zor bir soruyla tek başına {başa çıktı}.","🏆"]
);

ATASOZU.push(
["Bir çiçekle {bahar} olmaz","Tek bir olumlu örnek, genel bir sonuç için yeterli değildir.","🌸"],
["Gözden ırak olan {gönülden} de ırak olur","Uzakta kalan insanlar zamanla unutulur.","🛤️"],
["İki gönül bir olunca {samanlık} seyran olur","Anlaşan, birbirini seven insanlar zor şartlarda bile mutlu olur.","💞"],
["Taşıma suyla {değirmen} dönmez","Sürekli başkasının yardımıyla iş yürümez; kendi kaynağın olmalı.","⚙️"],
["Sel gider {kum} kalır","Geçici sıkıntılar geçer, kalıcı olan şeyler kalır.","🌊"],
["Aç ayı {oynamaz}","Karnı aç olan kişi iyi iş yapamaz; önce ihtiyaçlar karşılanmalı.","🐻"],
["Yanlış hesap {Bağdat'tan} döner","Yanlış yapılan bir iş, sonunda mutlaka düzeltilir.","🧮"],
["Akıl {akıldan} üstündür","Bir işte başkasının fikri de işe yarar; danışmak iyidir.","💡"],
["Çivi çiviyi {söker}","Bir güçlüğü bazen başka bir şey ortadan kaldırır.","🔨"],
["Zararın neresinden dönülse {kârdır}","Yanlış bir işe devam etmektense vazgeçmek daha iyidir.","✂️"],
["Sürüden ayrılanı {kurt} kapar","Topluluktan ayrı kalan kişi tehlikeye açık olur.","🐺"],
["Mum dibine ışık {vermez}","İnsan bazen en yakınındaki değerli şeyi fark edemez.","🕯️"],
["Söz gümüşse {sükût} altındır","Bazen susmak konuşmaktan daha değerlidir.","🤫"],
["Beş {parmağın} beşi bir değil","Her insan farklıdır, herkes aynı özelliklere sahip değildir.","✋"]
);

TEKERLEME.push(
["Çamlıca","Çamlıca'da çam çiçeği çıtır çıtır çatırdamış, çocuklar çevresinde çember çizmiş.","ç"],
["Gül Bahçesi","Gül dalında güzel güller, güneşe gülümseyen güllere güvercin gelmiş.","g"],
["Yunus","Yedi yaşında yeşil yelekli yürekli yavru yunus yüzmüş.","y"],
["Nine","Nine ninni söyleyince nehir nazlı nazlı akmış, nilüfer neşeyle uyumuş.","n"],
["Hocamız","Hızlı hızlı harfleri harmanlayan hocamız hepimize hikâye anlatmış.","h"],
["Ressam","Ressam Rıza rengârenk resimleri raflara rahatça resmetmiş.","r"],
["Fil","Fil fısıldayınca fare fırlayıp fındık fırlatmış.","f"],
["Kırk Küp","Kırk küpü kıran kırk kişi kırık küpleri kırk günde kırk kapıya kaldırmış.","k"]
);

FIKRA.push(
["Haklısın Hoca","Bir gün komşusu Hoca'ya gelip derdini anlatmış. Hoca onu dinleyip \"Haklısın\" demiş. Sonra öbür komşu gelip kendi tarafını anlatmış. Hoca ona da \"Haklısın\" demiş. Karısı olanları duymuş: \"Efendi, ikisi birden haklı olamaz!\" Hoca bir düşünmüş: \"Hanım, sen de haklısın!\"","Karısı Hoca'ya ne demiş?",["İkisi birden haklı olamaz","Sen çok yoruldun","Komşuları kapıdan kov"],["Karar vermeden önce olayın iki tarafını da dinlemeliyiz","Her söyleyene hemen \"haklısın\" demeliyiz","Komşularla hiç konuşmamalıyız"]],
["Bilenler Bilmeyenlere","Hoca bir gün kürsüye çıkıp halka seslenmiş: \"Size ne anlatacağımı biliyor musunuz?\" \"Bilmiyoruz\" demişler. Hoca: \"Bilmeyenlere anlatmaya gerek yok\" deyip inmiş. Ertesi gün aynı soruyu sormuş, bu sefer herkes \"Biliyoruz\" demiş. Hoca: \"Bilenlere anlatmaya gerek yok\" demiş. Üçüncü gün yine sormuş. Bir kısmı \"Biliyoruz\", bir kısmı \"Bilmiyoruz\" demiş. Hoca: \"Bilenler bilmeyenlere anlatsın!\" demiş.","Hoca üçüncü gün ne yapılmasını istemiş?",["Bilenlerin bilmeyenlere anlatmasını","Herkesin eve gitmesini","Konuşmanın ertelenmesini"],["Bildiklerimizi paylaşmak herkesin öğrenmesine yardım eder","Bilmediğimiz şeyi hiç sormamalıyız","Kürsüye çıkmak çok zordur"]]
);
