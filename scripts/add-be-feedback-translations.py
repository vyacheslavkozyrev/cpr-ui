#!/usr/bin/env python3
"""
Add proper Belarusian translations for feedback request section.
Uses consistent Belarusian terminology matching the existing file.
"""

import json
from pathlib import Path

def main():
    # Path to BE translation file
    be_file = Path(__file__).parent.parent / "public" / "locales" / "be" / "translation.json"
    
    print(f"Reading BE file: {be_file}")
    with open(be_file, 'r', encoding='utf-8') as f:
        be_data = json.load(f)
    
    # Complete Belarusian translations for pages.feedback.request
    belarusian_request = {
        "title": "Мае Запыты на Водгук",
        "createButton": "Запытаць Водгук",
        "comingSoon": "Тут будуць адлюстроўвацца вашы адпраўленыя запыты на водгук",
        "tabs": {
            "feedback": "Водгукі",
            "requests": "Запыты"
        },
        "form": {
            "title": "Запытаць Водгук",
            "employees": {
                "label": "Выберыце Супрацоўнікаў",
                "placeholder": "Шукайце супрацоўнікаў па імені, ролі або аддзеле...",
                "searchPlaceholder": "Шукаць па імені, email або пасадзе...",
                "required": "Калі ласка, выберыце хаця б аднаго супрацоўніка",
                "maxExceeded": "Максімум 20 атрымальнікаў на адзін запыт",
                "maxReached": "Дасягнута максімум {{max}} атрымальнікаў. Выдаліце атрымальнікаў, каб дадаць больш.",
                "searchEmpty": "Не знойдзена супрацоўнікаў, якія адпавядаюць вашаму пошуку",
                "noResults": "Супрацоўнікі не знойдзены",
                "selected": "{{count}} з {{max}} атрымальнікаў выбрана",
                "clearAll": "Ачысціць Усё",
                "filterLabel": "Фільтраваць па:",
                "filters": {
                    "department": "Аддзел",
                    "location": "Месцазнаходжанне",
                    "role": "Роля",
                    "all": "Усе",
                    "clear": "Ачысціць Фільтры"
                }
            },
            "project": {
                "label": "Праект (Неабавязкова)",
                "placeholder": "Выберыце кантэкст праекта...",
                "error": "Выбраны праект больш недаступны"
            },
            "goal": {
                "label": "Мэта (Неабавязкова)",
                "placeholder": "Выберыце звязаную мэту...",
                "error": "Выбраная мэта больш недаступная"
            },
            "message": {
                "label": "Паведамленне (Неабавязкова)",
                "placeholder": "Дадайце кантэкст або пытанні для вашага запыту на водгук...",
                "helperText": "{{count}}/500 сімвалаў",
                "maxLength": "Паведамленне павінна быць не больш за 500 сімвалаў"
            },
            "dueDate": {
                "label": "Тэрмін (Неабавязкова)",
                "placeholder": "Выберыце тэрмін...",
                "helperText": "Калі не ўказана, атрымальнікі атрымаюць нагадванні праз 7 і 3 дні",
                "error": "Тэрмін павінен быць у будучыні"
            },
          "buttons": {
            "send": "Адправіць Запыт",
            "sending": "Адпраўленне...",
            "cancel": "Адмяніць",
            "saveDraft": "Захаваць Чарнавік",
            "loadDraft": "Загрузіць Чарнавік",
            "discardDraft": "Адхіліць Чарнавік"
          },
          "draft": {
            "banner": "У вас ёсць незахаваны чарнавік ад {{time}}.",
            "loaded": "Чарнавік паспяхова загружаны",
            "discarded": "Чарнавік адхілены",
            "expired": "Тэрмін чарнавіка скончыўся"
          },
          "duplicate": {
            "title": "Выяўлены Паўторныя Атрымальнікі",
            "partialMessage": "{{count}} з вашых выбраных атрымальнікаў ужо маюць актыўны запыт для гэтага {{context}}:",
            "fullMessage": "Усе выбраныя атрымальнікі ужо маюць актыўныя запыты для гэтага {{context}}. Калі ласка, праглядзіце вашы існуючыя запыты.",
            "actions": {
              "removeDuplicates": "Выдаліць Дублікаты і Працягнуць",
              "viewExisting": "Прагледзець Існуючыя Запыты",
              "cancel": "Адмяніць"
            }
          },
          "confirmation": {
            "title": "Адхіліць запыт?",
            "message": "Вы ўпэўнены, што жадаеце адхіліць гэты запыт на водгук? Вашыя змены будуць захаваныя як чарнавік.",
            "actions": {
              "keepEditing": "Працягнуць Рэдагаванне",
              "discard": "Адхіліць"
            }
          }
        },
        "list": {
            "title": "Адпраўленыя Запыты",
            "empty": "Вы яшчэ не адправілі ніякіх запытаў на водгук",
            "emptyDescription": "Запытайце водгук ад сваіх калег, каб атрымаць каштоўныя меркаванні",
            "filters": {
                "all": "Усе",
                "pending": "У чаканні",
                "partial": "Частковыя",
                "complete": "Завершаныя",
                "cancelled": "Скасаваныя"
            },
            "sort": {
                "newest": "Найноўшыя",
                "oldest": "Найстарэйшыя",
                "dueDate": "Тэрмін"
            },
            "search": "Шукаць запыты...",
            "itemsPerPage": "Элементаў на старонку:",
            "showingResults": "Паказаны {{from}}-{{to}} з {{total}} запытаў"
        },
        "card": {
            "recipients": "Атрымальнікі:",
            "recipientsCount": "{{completed}} з {{total}} адказалі",
            "project": "Праект:",
            "goal": "Мэта:",
            "message": "Паведамленне:",
            "dueDate": "Тэрмін:",
            "createdAt": "Створана:",
            "actions": {
                "viewFeedback": "Прагледзець Водгук",
                "remind": "Нагадаць",
                "cancel": "Скасаваць",
                "expand": "Паказаць Больш",
                "collapse": "Паказаць Менш"
            },
            "overdue": "Пратэрмінавана",
            "dueToday": "Тэрмін сёння",
            "dueSoon": "Тэрмін хутка"
        },
        "detail": {
            "title": "Падрабязнасці Запыту на Водгук",
            "requestInfo": "Інфармацыя аб Запыце",
            "recipientStatus": "Статус Атрымальнікаў",
            "noRecipients": "Няма атрымальнікаў",
            "history": "Гісторыя",
            "noHistory": "Няма гісторыі для адлюстравання"
        },
        "toasts": {
            "created": "Запыт на водгук паспяхова адпраўлены",
            "updated": "Запыт на водгук абноўлены",
            "cancelled": "Запыт на водгук скасаваны",
            "reminderSent": "Нагадванне адпраўлена {{name}}",
            "remindersSent": "Нагадванні адпраўлены {{count}} атрымальнікам",
            "error": {
                "employeeNotFound": "Выбраны супрацоўнік не знойдзены. Калі ласка, паспрабуйце іншага.",
                "duplicateRequest": "У вас ужо ёсць актыўны запыт для гэтага супрацоўніка. Калі ласка, праглядзьце вашы адпраўленыя запыты.",
                "invalidGoal": "Выбраная мэта больш недаступная. Калі ласка, выберыце іншую або выдаліце мэту.",
                "invalidProject": "Выбраны праект больш недаступны. Калі ласка, выберыце іншы або выдаліце праект.",
                "selfRequest": "Вы не можаце запытаць водгук у сябе.",
                "rateLimit": "Вы стварылі занадта шмат запытаў сёння. Калі ласка, паспрабуйце заўтра.",
                "dailyLimit": "Дасягнута дзённы ліміт. Вы можаце ствараць да 50 запытаў на водгук у дзень. Паспрабуйце заўтра.",
                "networkError": "Немагчыма адправіць запыт на водгук. Калі ласка, праверце вашае злучэнне і паспрабуйце яшчэ раз.",
                "timeout": "Час чакання запыту скончыўся. Калі ласка, паспрабуйце яшчэ раз.",
                "generic": "Нешта пайшло не так. Калі ласка, паспрабуйце яшчэ раз."
            },
            "offline": {
                "queued": "Вы афлайн. Запыт будзе адпраўлены аўтаматычна пры аднаўленні злучэння.",
                "syncFailed": "Не ўдалося адправіць запыт. Націсніце, каб паўтарыць."
            }
        },
        "validation": {
            "employeesRequired": "Калі ласка, выберыце хаця б аднаго супрацоўніка",
            "employeesMax": "Максімум 20 атрымальнікаў на адзін запыт",
            "messageMaxLength": "Паведамленне павінна быць не больш за 500 сімвалаў (зараз: {{length}})",
            "dueDatePast": "Тэрмін павінен быць сёння або ў будучыні",
            "dueDateInvalid": "Калі ласка, выберыце правільную дату"
        },
        "cancel": {
            "title": "Скасаваць Запыт на Водгук",
            "message": "Вы ўпэўнены, што жадаеце скасаваць гэты запыт? Усе атрымальнікі будуць апавешчаны.",
            "recipientMessage": "Скасаваць запыт для {{name}}?",
            "recipientConfirm": "Гэты атрымальнік будзе выдалены з запыту і апавешчаны.",
            "confirm": "Скасаваць Запыт",
            "keepRequest": "Захаваць Запыт",
            "reason": {
                "label": "Прычына скасавання (Неабавязкова)",
                "placeholder": "Растлумачце, чаму вы скасоўваеце гэты запыт..."
            }
        },
        "status": {
            "pending": "У чаканні",
            "partial": "Частковы",
            "complete": "Завершаны",
            "cancelled": "Скасаваны",
            "responded": "Адказана",
            "notResponded": "Не адказана",
            "overdue": "Пратэрмінавана"
        },
        "accessibility": {
            "recipientAvatar": "Аватар {{name}}",
            "statusBadge": "Статус: {{status}}",
            "expandCard": "Разгарнуць картку запыту",
            "collapseCard": "Згарнуць картку запыту",
            "filterByStatus": "Фільтраваць па статусу",
            "sortBy": "Сартаваць па",
            "searchRequests": "Шукаць запыты"
        }
    }
    
    # Update the BE data
    if 'pages' not in be_data:
        be_data['pages'] = {}
    if 'feedback' not in be_data['pages']:
        be_data['pages']['feedback'] = {}
    
    # Replace the request section with proper Belarusian translations
    be_data['pages']['feedback']['request'] = belarusian_request
    
    # Write back with UTF-8 encoding
    print(f"Writing updated BE file: {be_file}")
    with open(be_file, 'w', encoding='utf-8') as f:
        json.dump(be_data, f, ensure_ascii=False, indent=2)
    
    print("✓ BE translation file updated with proper Belarusian translations")
    print(f"✓ Added {len(str(belarusian_request))} characters of Belarusian text")
    print("✓ All keys now have proper Belarusian translations")

if __name__ == "__main__":
    main()
