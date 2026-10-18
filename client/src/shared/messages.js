export const MESSAGE_SUGGESTIONS = [
  {
    id: 'funny',
    label: 'Hài hước',
    emoji: '😆',
    samples: [
      'Chúc {name} 20/10 vui vẻ! Mong cậu luôn xinh như hoa, học giỏi như Google và ăn hoài không mập. Nếu lỡ có ai bắt nạt thì cứ báo tụi tớ, tụi tớ… sẽ đứng sau cổ vũ thật to nhé! 😎',
      'Hôm nay là 20/10, theo luật lớp mình thì {name} được miễn trực nhật, miễn bị gọi lên bảng (nếu cô đồng ý) và được quyền sai bảo con trai cả ngày. Tận hưởng đi nha! 👑',
      'Gửi {name}: chúc cậu một ngày 20/10 deadline tự bay màu, wifi luôn full vạch, trà sữa luôn full topping và crush tự động rep tin nhắn trong 3 giây! 🧋',
    ],
  },
  {
    id: 'sweet',
    label: 'Tình cảm',
    emoji: '💖',
    samples: [
      'Gửi {name} thân mến,\nCảm ơn cậu vì đã luôn là một phần thật đẹp trong những ngày tháng đi học của tụi tớ. Chúc cậu 20/10 thật nhiều niềm vui, luôn rạng rỡ và được yêu thương thật nhiều nhé! 🌸',
      'Chúc {name} luôn giữ được nụ cười trong veo như ngày đầu tiên tụi mình gặp nhau. Mong mọi điều dịu dàng nhất của thế giới đều tìm đến cậu, hôm nay và cả những ngày sau nữa. 💐',
    ],
  },
  {
    id: 'study',
    label: 'Chúc học giỏi',
    emoji: '📚',
    samples: [
      'Chúc {name} 20/10 thật rực rỡ! Học kỳ này điểm nào cũng 10, bài kiểm tra nào cũng trúng tủ, và mùa thi tới sẽ bước vào phòng thi với tâm thế của một nữ hoàng. Cố lên nha! ✨',
      'Gửi {name}: mong cậu luôn giữ ngọn lửa đam mê, chinh phục mọi mục tiêu đã đặt ra. Tụi tớ tin cậu sẽ đi thật xa và tỏa sáng thật rực rỡ. Happy Women\'s Day! 🎓',
    ],
  },
  {
    id: 'love',
    label: 'Chúc sớm thoát ế',
    emoji: '💘',
    samples: [
      'Chúc {name} 20/10 nhận được thật nhiều hoa, và năm nay chính thức thoát kiếp FA nhé! Nếu chưa có ai thì đừng lo, cả lớp sẽ là "người yêu tạm thời" của cậu hôm nay! 😘',
      'Gửi {name}: chúc cậu sớm gặp được người thương cậu nhiều hơn thương điện thoại, nhớ cậu nhiều hơn nhớ deadline, và đưa đón cậu đi học mỗi ngày (kể cả trời mưa). 🌹',
    ],
  },
  {
    id: 'poem',
    label: 'Thơ thẩn',
    emoji: '🪶',
    samples: [
      'Hai mươi tháng mười gió heo may,\nGửi {name} một chút nắng ban ngày.\nChúc cậu cười tươi như hoa nở,\nThanh xuân rực rỡ, mãi hôm nay. 🌼',
    ],
  },
];

export const fillMessage = (text, name) =>
  text.replaceAll('{name}', (name || '').trim() || 'cậu');
