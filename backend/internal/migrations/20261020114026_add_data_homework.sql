-- +goose Up
-- +goose StatementBegin
DO $$
DECLARE
    v_event_id UUID;
    v_hw_id UUID;
    v_task_id UUID;

    -- Параметры по умолчанию для создаваемых ДЗ и заданий
    v_hw_status INT := 1;
    v_task_points INT := 1;
    v_publish_at TIMESTAMPTZ := '2026-10-19 00:00:00+03';
    v_deadline_at TIMESTAMPTZ := '2026-10-25 23:59:59+03';
BEGIN

    -- =========================================================================
    -- 1. БИОЛОГИЯ
    -- =========================================================================
    SELECT id INTO v_event_id FROM events
    WHERE name = 'Олимпиадная биология (25.10.2026 - 31.10.26)' LIMIT 1;

    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Event not found: Олимпиадная биология (25.10.2026 - 31.10.26)';
    END IF;

    INSERT INTO homeworks (event_id, name, status, publish_at, deadline_at)
    VALUES (v_event_id, 'Тестовое задание по биологии', v_hw_status, v_publish_at, v_deadline_at)
    RETURNING id INTO v_hw_id;

    -- Биология: Задание 1
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 1',
        'Какой органоид эукариотической клетки называют её «энергетической станцией», так как в нём происходит клеточное дыхание и синтез молекул АТФ? Укажите одну цифру.' || E'\n' ||
        '1) рибосома' || E'\n' ||
        '2) митохондрия' || E'\n' ||
        '3) комплекс Гольджи' || E'\n' ||
        '4) клеточный центр',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '2', TRUE);

    -- Биология: Задание 2
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 2',
        'Какие три из перечисленных органов относятся к пищеварительной системе человека? Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) желудок' || E'\n' ||
        '2) трахея' || E'\n' ||
        '3) печень' || E'\n' ||
        '4) почка' || E'\n' ||
        '5) тонкая кишка' || E'\n' ||
        '6) гортань',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 3 5', TRUE);

    -- Биология: Задание 3
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 3',
        'Установите соответствие между форменными элементами крови человека и их основной функцией в организме. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Форменные элементы крови:' || E'\n' ||
        'А) эритроциты' || E'\n' ||
        'Б) лейкоциты' || E'\n' ||
        'В) тромбоциты' || E'\n\n' ||
        'Функции:' || E'\n' ||
        '1) участие в свёртывании крови при повреждении сосудов' || E'\n' ||
        '2) перенос кислорода от лёгких к тканям и органам' || E'\n' ||
        '3) защита организма от бактерий и вирусов (иммунитет)',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А2 Б3 В1', TRUE);

    -- Биология: Задание 4
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 4',
        'Выберите три структуры, которые входят в состав кровеносной системы человека. Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) сердце' || E'\n' ||
        '2) аорта' || E'\n' ||
        '3) бронхи' || E'\n' ||
        '4) пищевод' || E'\n' ||
        '5) капилляры' || E'\n' ||
        '6) мочеточники',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 2 5', TRUE);

    -- Биология: Задание 5
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 5',
        'Установите правильную последовательность прохождения воздуха по органам дыхательной системы человека во время вдоха. Запишите последовательность цифр через пробел без знаков препинания.' || E'\n' ||
        '1) трахея' || E'\n' ||
        '2) носовая полость' || E'\n' ||
        '3) альвеолы лёгких' || E'\n' ||
        '4) гортань' || E'\n' ||
        '5) бронхи',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '2 4 1 5 3', TRUE);


    -- =========================================================================
    -- 2. ИНФОРМАТИКА
    -- =========================================================================
    SELECT id INTO v_event_id FROM events
    WHERE name = 'Олимпиадная информатика (профиль «Программирование») (25.10.2026 - 31.10.26)' LIMIT 1;

    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Event not found: Олимпиадная информатика (профиль «Программирование») (25.10.2026 - 31.10.26)';
    END IF;

    INSERT INTO homeworks (event_id, name, status, publish_at, deadline_at)
    VALUES (v_event_id, 'Тестовое задание по информатике', v_hw_status, v_publish_at, v_deadline_at)
    RETURNING id INTO v_hw_id;

    -- Информатика: Задание 1
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 1',
        'Переведите двоичное число 1101 в десятичную систему счисления. Укажите одну цифру, соответствующую верному варианту ответа.' || E'\n' ||
        '1) 11' || E'\n' ||
        '2) 13' || E'\n' ||
        '3) 14' || E'\n' ||
        '4) 15',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '2', TRUE);

    -- Информатика: Задание 2
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 2',
        'Выберите три верных соотношения между единицами измерения количества информации. Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) 1 байт = 8 бит' || E'\n' ||
        '2) 1 байт = 10 бит' || E'\n' ||
        '3) 1 Кбайт = 1024 байт' || E'\n' ||
        '4) 1 Кбайт = 1000 байт' || E'\n' ||
        '5) 2 байта = 16 бит',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 3 5', TRUE);

    -- Информатика: Задание 3
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 3',
        'Установите соответствие между базовой логической операцией и её научным названием в алгебре логики. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Логические операции:' || E'\n' ||
        'А) логическое умножение («И»)' || E'\n' ||
        'Б) логическое сложение («ИЛИ»)' || E'\n' ||
        'В) логическое отрицание («НЕ»)' || E'\n\n' ||
        'Названия:' || E'\n' ||
        '1) дизъюнкция' || E'\n' ||
        '2) инверсия' || E'\n' ||
        '3) конъюнкция',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А3 Б1 В2', TRUE);

    -- Информатика: Задание 4
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 4',
        'Установите соответствие между базовой алгоритмической конструкцией и её описанием. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Алгоритмические конструкции:' || E'\n' ||
        'А) следование' || E'\n' ||
        'Б) ветвление' || E'\n' ||
        'В) повторение (цикл)' || E'\n\n' ||
        'Описания:' || E'\n' ||
        '1) выбор одной из двух серий команд в зависимости от истинности условия' || E'\n' ||
        '2) последовательное выполнение команд друг за другом в порядке их записи' || E'\n' ||
        '3) многократное выполнение одной и той же последовательности команд',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А2 Б1 В3', TRUE);

    -- Информатика: Задание 5
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 5',
        'Какие три из перечисленных записей чисел могут существовать в восьмеричной системе счисления (содержат только допустимые для неё цифры)? Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) 107' || E'\n' ||
        '2) 285' || E'\n' ||
        '3) 740' || E'\n' ||
        '4) 591' || E'\n' ||
        '5) 326' || E'\n' ||
        '6) 801',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 3 5', TRUE);


    -- =========================================================================
    -- 3. МАТЕМАТИКА
    -- =========================================================================
    SELECT id INTO v_event_id FROM events
    WHERE name = 'Олимпиадная математика (25.10.2026 - 31.10.26)' LIMIT 1;

    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Event not found: Олимпиадная математика (25.10.2026 - 31.10.26)';
    END IF;

    INSERT INTO homeworks (event_id, name, status, publish_at, deadline_at)
    VALUES (v_event_id, 'Тестовое задание по математике', v_hw_status, v_publish_at, v_deadline_at)
    RETURNING id INTO v_hw_id;

    -- Математика: Задание 1
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 1',
        'Вычислите значение выражения √25 + √49. Укажите одну цифру, соответствующую верному варианту ответа.' || E'\n' ||
        '1) 12' || E'\n' ||
        '2) 14' || E'\n' ||
        '3) 35' || E'\n' ||
        '4) 74',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1', TRUE);

    -- Математика: Задание 2
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 2',
        'Какие два из перечисленных чисел являются корнями квадратного уравнения x² - 7x + 10 = 0? Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) -2' || E'\n' ||
        '2) 2' || E'\n' ||
        '3) -5' || E'\n' ||
        '4) 5' || E'\n' ||
        '5) 7',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '2 4', TRUE);

    -- Математика: Задание 3
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 3',
        'Установите соответствие между формулой, задающей функцию, и названием её графика. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Функции:' || E'\n' ||
        'А) y = 3x - 2' || E'\n' ||
        'Б) y = x²' || E'\n' ||
        'В) y = 6/x' || E'\n\n' ||
        'Графики:' || E'\n' ||
        '1) парабола' || E'\n' ||
        '2) гипербола' || E'\n' ||
        '3) прямая',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А3 Б1 В2', TRUE);

    -- Математика: Задание 4
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 4',
        'Выберите три верных геометрических утверждения. Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) В параллелограмме противоположные стороны равны и противоположные углы равны.' || E'\n' ||
        '2) Диагонали любой трапеции точкой пересечения делятся пополам.' || E'\n' ||
        '3) В прямоугольном треугольнике квадрат длины гипотенузы равен сумме квадратов длин катетов.' || E'\n' ||
        '4) Ромбом называется параллелограмм, у которого все углы прямые.' || E'\n' ||
        '5) Диагонали прямоугольника равны.',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 3 5', TRUE);

    -- Математика: Задание 5
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 5',
        'Установите соответствие между плоской геометрической фигурой и формулой для вычисления её площади (a, b - стороны или основания, h - проведённая к ним высота). Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Фигуры:' || E'\n' ||
        'А) прямоугольник со сторонами a и b' || E'\n' ||
        'Б) треугольник со стороной a и высотой h' || E'\n' ||
        'В) трапеция с основаниями a, b и высотой h' || E'\n\n' ||
        'Формулы площади:' || E'\n' ||
        '1) S = 1/2 · a · h' || E'\n' ||
        '2) S = a · b' || E'\n' ||
        '3) S = ((a + b) / 2) · h',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А2 Б1 В3', TRUE);


    -- =========================================================================
    -- 4. ФИЗИКА
    -- =========================================================================
    SELECT id INTO v_event_id FROM events
    WHERE name = 'Олимпиадная физика (25.10.2026 - 31.10.26)' LIMIT 1;

    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Event not found: Олимпиадная физика (25.10.2026 - 31.10.26)';
    END IF;

    INSERT INTO homeworks (event_id, name, status, publish_at, deadline_at)
    VALUES (v_event_id, 'Тестовое задание по физике', v_hw_status, v_publish_at, v_deadline_at)
    RETURNING id INTO v_hw_id;

    -- Физика: Задание 1
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 1',
        'Установите соответствие между электрической величиной и единицей её измерения в Международной системе единиц (СИ). Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Физические величины:' || E'\n' ||
        'А) сила электрического тока' || E'\n' ||
        'Б) электрическое напряжение' || E'\n' ||
        'В) электрическое сопротивление' || E'\n\n' ||
        'Единицы измерения:' || E'\n' ||
        '1) В (вольт)' || E'\n' ||
        '2) Ом (ом)' || E'\n' ||
        '3) А (ампер)',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А3 Б1 В2', TRUE);

    -- Физика: Задание 2
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 2',
        'Напряжение на концах участка цепи равно 12 В, а электрическое сопротивление этого участка составляет 4 Ом. Чему равна сила тока на этом участке цепи по закону Ома? Укажите одну цифру, соответствующую верному варианту ответа.' || E'\n' ||
        '1) 0,33 А' || E'\n' ||
        '2) 3 А' || E'\n' ||
        '3) 8 А' || E'\n' ||
        '4) 48 А',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '2', TRUE);

    -- Физика: Задание 3
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 3',
        'Установите соответствие между названием теплового процесса и переходом вещества из одного агрегатного состояния в другое. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Тепловые процессы:' || E'\n' ||
        'А) плавление' || E'\n' ||
        'Б) конденсация' || E'\n' ||
        'В) парообразование' || E'\n\n' ||
        'Переходы между состояниями:' || E'\n' ||
        '1) переход вещества из жидкого состояния в газообразное' || E'\n' ||
        '2) переход вещества из твёрдого состояния в жидкое' || E'\n' ||
        '3) переход вещества из газообразного состояния в жидкое',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А2 Б3 В1', TRUE);

    -- Физика: Задание 4
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 4',
        'Какие три из перечисленных веществ и материалов являются проводниками электрического тока? Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) медь' || E'\n' ||
        '2) дистиллированная (очищенная от примесей) вода' || E'\n' ||
        '3) алюминий' || E'\n' ||
        '4) сухое дерево' || E'\n' ||
        '5) водный раствор поваренной соли' || E'\n' ||
        '6) резина',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 3 5', TRUE);

    -- Физика: Задание 5
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 5',
        'Установите соответствие между физической величиной и формулой для её вычисления. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Физические величины:' || E'\n' ||
        'А) количество теплоты, необходимое для нагревания тела' || E'\n' ||
        'Б) количество теплоты, выделяющееся при полном сгорании топлива' || E'\n' ||
        'В) работа электрического тока на участке цепи' || E'\n\n' ||
        'Формулы:' || E'\n' ||
        '1) Q = q · m' || E'\n' ||
        '2) A = U · I · t' || E'\n' ||
        '3) Q = c · m · (t₂ - t₁)',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А3 Б1 В2', TRUE);


    -- =========================================================================
    -- 5. ХИМИЯ
    -- =========================================================================
    SELECT id INTO v_event_id FROM events
    WHERE name = 'Олимпиадная химия (25.10.2026 - 31.10.26)' LIMIT 1;

    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Event not found: Олимпиадная химия (25.10.2026 - 31.10.26)';
    END IF;

    INSERT INTO homeworks (event_id, name, status, publish_at, deadline_at)
    VALUES (v_event_id, 'Тестовое задание по химии', v_hw_status, v_publish_at, v_deadline_at)
    RETURNING id INTO v_hw_id;

    -- Химия: Задание 1
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 1',
        'Установите соответствие между химической формулой вещества и классом неорганических соединений, к которому оно принадлежит. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Формулы веществ:' || E'\n' ||
        'А) H₂SO₄' || E'\n' ||
        'Б) NaOH' || E'\n' ||
        'В) CaO' || E'\n\n' ||
        'Классы соединений:' || E'\n' ||
        '1) оксид' || E'\n' ||
        '2) основание' || E'\n' ||
        '3) кислота',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А3 Б2 В1', TRUE);

    -- Химия: Задание 2
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 2',
        'Выберите из списка три химических элемента, которые образуют простые вещества - металлы. Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) натрий (Na)' || E'\n' ||
        '2) сера (S)' || E'\n' ||
        '3) железо (Fe)' || E'\n' ||
        '4) кислород (O)' || E'\n' ||
        '5) медь (Cu)' || E'\n' ||
        '6) фосфор (P)',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 3 5', TRUE);

    -- Химия: Задание 3
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 3',
        'Какой вид химической связи характерен для хлорида натрия (NaCl), образованного типичным металлом и типичным неметаллом? Укажите одну цифру.' || E'\n' ||
        '1) ковалентная неполярная' || E'\n' ||
        '2) ковалентная полярная' || E'\n' ||
        '3) ионная' || E'\n' ||
        '4) металлическая',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '3', TRUE);

    -- Химия: Задание 4
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 4',
        'Установите соответствие между уравнением химической реакции и её типом. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Уравнения реакций:' || E'\n' ||
        'А) CaCO₃ → CaO + CO₂' || E'\n' ||
        'Б) 2Mg + O₂ → 2MgO' || E'\n' ||
        'В) Zn + 2HCl → ZnCl₂ + H₂' || E'\n\n' ||
        'Типы реакций:' || E'\n' ||
        '1) реакция соединения' || E'\n' ||
        '2) реакция разложения' || E'\n' ||
        '3) реакция замещения',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А2 Б1 В3', TRUE);

    -- Химия: Задание 5
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 5',
        'Выберите три верных утверждения о строении атома натрия (Na), который расположен в Периодической системе Д. И. Менделеева под порядковым номером 11 и имеет относительную атомную массу 23. Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) Заряд ядра атома натрия равен +11.' || E'\n' ||
        '2) В ядре атома натрия содержится 23 протона.' || E'\n' ||
        '3) В электронной оболочке нейтрального атома натрия находится 11 электронов.' || E'\n' ||
        '4) Все электроны атома натрия расположены на двух энергетических уровнях (слоях).' || E'\n' ||
        '5) В ядре атома натрия содержится 12 нейтронов.',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 3 5', TRUE);


    -- =========================================================================
    -- 6. ЭКОНОМИКА
    -- =========================================================================
    SELECT id INTO v_event_id FROM events
    WHERE name = 'Олимпиадная экономика (25.10.2026 - 31.10.26)' LIMIT 1;

    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Event not found: Олимпиадная экономика (25.10.2026 - 31.10.26)';
    END IF;

    INSERT INTO homeworks (event_id, name, status, publish_at, deadline_at)
    VALUES (v_event_id, 'Тестовое задание по экономике', v_hw_status, v_publish_at, v_deadline_at)
    RETURNING id INTO v_hw_id;

    -- Экономика: Задание 1
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 1',
        'Установите соответствие между фактором производства и видом дохода, который получает собственник данного фактора. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Факторы производства:' || E'\n' ||
        'А) труд' || E'\n' ||
        'Б) земля' || E'\n' ||
        'В) капитал' || E'\n\n' ||
        'Факторные доходы:' || E'\n' ||
        '1) рента' || E'\n' ||
        '2) заработная плата' || E'\n' ||
        '3) процент',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А2 Б1 В3', TRUE);

    -- Экономика: Задание 2
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 2',
        'Как согласно закону спроса изменится величина спроса на обычный товар при снижении цены на него (при прочих равных условиях)? Укажите одну цифру.' || E'\n' ||
        '1) увеличится' || E'\n' ||
        '2) уменьшится' || E'\n' ||
        '3) не изменится' || E'\n' ||
        '4) упадёт до нуля',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1', TRUE);

    -- Экономика: Задание 3
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 3',
        'Установите соответствие между базовой функцией денег и иллюстрирующим её примером. Запишите в ответ пары «буква-цифра» через пробел без знаков препинания.' || E'\n\n' ||
        'Функции денег:' || E'\n' ||
        'А) мера стоимости' || E'\n' ||
        'Б) средство обращения (обмена)' || E'\n' ||
        'В) средство накопления (сбережения)' || E'\n\n' ||
        'Примеры:' || E'\n' ||
        '1) семья ежемесячно откладывает часть дохода для будущей покупки загородного дома' || E'\n' ||
        '2) на ценнике в книжном магазине указана цена учебника - 800 рублей' || E'\n' ||
        '3) школьник расплатился на кассе столовой за горячий обед',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, 'А2 Б3 В1', TRUE);

    -- Экономика: Задание 4
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 4',
        'Какие три из перечисленных позиций относятся к доходной части семейного бюджета? Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) заработная плата родителей' || E'\n' ||
        '2) оплата коммунальных услуг (ЖКХ)' || E'\n' ||
        '3) государственная пенсия бабушки' || E'\n' ||
        '4) покупка продуктов питания' || E'\n' ||
        '5) проценты по банковскому вкладу' || E'\n' ||
        '6) уплата налога на имущество',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 3 5', TRUE);

    -- Экономика: Задание 5
    INSERT INTO tasks (name, description, max_points) VALUES (
        'Задание 5',
        'Какие три из перечисленных признаков характеризуют рыночную экономическую систему? Запишите соответствующие цифры в порядке возрастания через пробел без знаков препинания.' || E'\n' ||
        '1) преобладание частной собственности на средства производства' || E'\n' ||
        '2) свободное ценообразование на основе соотношения спроса и предложения' || E'\n' ||
        '3) директивное планирование производства всех товаров государством' || E'\n' ||
        '4) конкуренция производителей товаров и услуг' || E'\n' ||
        '5) централизованное распределение ресурсов правительством',
        v_task_points
    ) RETURNING id INTO v_task_id;
    INSERT INTO homework_tasks (homework_id, task_id) VALUES (v_hw_id, v_task_id);
    INSERT INTO task_answers (task_id, answer, correct) VALUES (v_task_id, '1 2 4', TRUE);

END $$;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Сначала удаляем задачи (связи в homework_tasks и ответы в task_answers удалятся каскадно)
DELETE FROM tasks
WHERE id IN (
    SELECT ht.task_id
    FROM homework_tasks ht
    JOIN homeworks h ON h.id = ht.homework_id
    JOIN events e ON e.id = h.event_id
    WHERE e.name IN (
        'Олимпиадная математика (25.10.2026 - 31.10.26)',
        'Олимпиадная физика (25.10.2026 - 31.10.26)',
        'Олимпиадная химия (25.10.2026 - 31.10.26)',
        'Олимпиадная биология (25.10.2026 - 31.10.26)',
        'Олимпиадная информатика (профиль «Программирование») (25.10.2026 - 31.10.26)',
        'Олимпиадная экономика (25.10.2026 - 31.10.26)'
    )
);

-- Затем удаляем сами домашние работы
DELETE FROM homeworks
WHERE event_id IN (
    SELECT id FROM events
    WHERE name IN (
        'Олимпиадная математика (25.10.2026 - 31.10.26)',
        'Олимпиадная физика (25.10.2026 - 31.10.26)',
        'Олимпиадная химия (25.10.2026 - 31.10.26)',
        'Олимпиадная биология (25.10.2026 - 31.10.26)',
        'Олимпиадная информатика (профиль «Программирование») (25.10.2026 - 31.10.26)',
        'Олимпиадная экономика (25.10.2026 - 31.10.26)'
    )
);
-- +goose StatementEnd